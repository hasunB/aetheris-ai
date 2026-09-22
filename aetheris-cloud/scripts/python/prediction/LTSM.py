import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from torch.utils.data import Dataset, DataLoader

# ──────────────────────────────────────────────
# 1. DATA LOADING & WINDOWING
# ──────────────────────────────────────────────

INPUT_WINDOW = 500    # past samples
OUTPUT_WINDOW = 60    # future samples to predict

class SensorDataset(Dataset):
    """Creates sliding window pairs from raw sensor time series."""
    
    def __init__(self, data: np.ndarray, input_len=500, output_len=60):
        self.input_len = input_len
        self.output_len = output_len
        self.data = data
        self.total_len = input_len + output_len
    
    def __len__(self):
        return len(self.data) - self.total_len + 1
    
    def __getitem__(self, idx):
        x = self.data[idx : idx + self.input_len]            # (500,)
        y = self.data[idx + self.input_len : idx + self.total_len]  # (60,)
        return (
            torch.FloatTensor(x).unsqueeze(-1),  # (500, 1)
            torch.FloatTensor(y)                  # (60,)
        )


def load_and_prepare(csv_path, label, norm_type="zscore"):
    """Load sensor data from CSV, filter by label, normalize."""
    df = pd.read_csv(csv_path)
    series = df[df["label"] == label].sort_values("timestamp")["value"].values
    
    if norm_type == "zscore":
        mean, std = series.mean(), series.std()
        normalized = (series - mean) / std
        params = {"mean": mean, "std": std}
    else:  # minmax
        vmin, vmax = series.min(), series.max()
        normalized = (series - vmin) / (vmax - vmin)
        params = {"min": vmin, "max": vmax}
    
    return normalized, params


# ──────────────────────────────────────────────
# 2. MODEL DEFINITION
# ──────────────────────────────────────────────

class SensorLSTM(nn.Module):
    """
    LSTM for multi-step time series forecasting.
    Input:  (batch, 500, 1)  → 500 past values
    Output: (batch, 60)      → 60 future values
    """
    
    def __init__(self, input_size=1, hidden_sizes=[128, 64],
                 output_size=60, dropout=0.2):
        super().__init__()
        
        self.lstm1 = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_sizes[0],
            batch_first=True,
            dropout=dropout if len(hidden_sizes) > 1 else 0
        )
        
        self.lstm2 = nn.LSTM(
            input_size=hidden_sizes[0],
            hidden_size=hidden_sizes[1],
            batch_first=True
        )
        
        self.fc = nn.Sequential(
            nn.Linear(hidden_sizes[-1], 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, output_size)
        )
    
    def forward(self, x):
        # x shape: (batch, 500, 1)
        out, _ = self.lstm1(x)          # (batch, 500, 128)
        out, _ = self.lstm2(out)        # (batch, 500, 64)
        out = out[:, -1, :]             # (batch, 64) ← last timestep only
        out = self.fc(out)              # (batch, 60)
        return out


# ──────────────────────────────────────────────
# 3. TRAINING LOOP
# ──────────────────────────────────────────────

def train_model(label, csv_path, norm_type="zscore",
                hidden_sizes=[128, 64], dropout=0.2,
                lr=1e-3, epochs=50, batch_size=64):
    
    # Prepare data
    data, norm_params = load_and_prepare(csv_path, label, norm_type)
    
    # 80/10/10 split (temporal — no shuffling!)
    n = len(data)
    train_data = data[:int(0.8 * n)]
    val_data   = data[int(0.8 * n):int(0.9 * n)]
    test_data  = data[int(0.9 * n):]
    
    train_ds = SensorDataset(train_data)
    val_ds   = SensorDataset(val_data)
    test_ds  = SensorDataset(test_data)
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader   = DataLoader(val_ds, batch_size=batch_size)
    test_loader  = DataLoader(test_ds, batch_size=batch_size)
    
    # Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SensorLSTM(
        hidden_sizes=hidden_sizes,
        output_size=OUTPUT_WINDOW,
        dropout=dropout
    ).to(device)
    
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, patience=5, factor=0.5
    )
    criterion = nn.MSELoss()
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # ── Train ──
        model.train()
        train_loss = 0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            pred = model(x)
            loss = criterion(pred, y)
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_loss += loss.item()
        
        # ── Validate ──
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device), y.to(device)
                pred = model(x)
                val_loss += criterion(pred, y).item()
        
        avg_val = val_loss / len(val_loader)
        scheduler.step(avg_val)
        
        if avg_val < best_val_loss:
            best_val_loss = avg_val
            torch.save(model.state_dict(), f"best_{label.lower()}_lstm.pt")
        
        print(f"Epoch {epoch+1}/{epochs} | "
              f"Train: {train_loss/len(train_loader):.6f} | "
              f"Val: {avg_val:.6f}")
    
    # ── Test ──
    model.load_state_dict(torch.load(f"best_{label.lower()}_lstm.pt"))
    model.eval()
    test_loss = 0
    all_preds, all_targets = [], []
    with torch.no_grad():
        for x, y in test_loader:
            x, y = x.to(device), y.to(device)
            pred = model(x)
            test_loss += criterion(pred, y).item()
            all_preds.append(pred.cpu().numpy())
            all_targets.append(y.cpu().numpy())
    
    preds = np.concatenate(all_preds)
    targets = np.concatenate(all_targets)
    
    # Per-step MAPE
    mape_per_step = np.mean(
        np.abs(preds - targets) / (np.abs(targets) + 1e-8), axis=0
    ) * 100
    
    print(f"\nTest MSE: {test_loss / len(test_loader):.6f}")
    print(f"MAPE step 1:  {mape_per_step[0]:.2f}%")
    print(f"MAPE step 30: {mape_per_step[29]:.2f}%")
    print(f"MAPE step 60: {mape_per_step[59]:.2f}%")
    
    return model, norm_params


# ──────────────────────────────────────────────
# 4. Run training for all 3 sensors
# ──────────────────────────────────────────────

if __name__ == "__main__":
    CSV_PATH = "sensor_data_export.csv"
    
    # Train Input (voltage) model
    input_model, input_norm = train_model(
        label="Input", csv_path=CSV_PATH,
        norm_type="zscore",
        hidden_sizes=[128, 64], dropout=0.3,
        lr=1e-3, epochs=80
    )
    
    # Train Seeing model
    seeing_model, seeing_norm = train_model(
        label="Seeing", csv_path=CSV_PATH,
        norm_type="minmax",
        hidden_sizes=[128, 64], dropout=0.2,
        lr=1e-3, epochs=80
    )
    
    # Train Temp model
    temp_model, temp_norm = train_model(
        label="Temp", csv_path=CSV_PATH,
        norm_type="minmax",
        hidden_sizes=[64], dropout=0.1,
        lr=5e-4, epochs=50
    )
