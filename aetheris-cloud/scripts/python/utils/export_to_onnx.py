import torch
import json

def export_to_onnx(model, label, norm_params):
    """Export trained PyTorch model to ONNX format."""
    model.eval()
    
    # Dummy input matching inference shape: (1, 500, 1)
    dummy_input = torch.randn(1, 500, 1)
    
    onnx_path = f"{label.lower()}_lstm.onnx"
    
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["sensor_input"],
        output_names=["prediction"],
        dynamic_axes={
            "sensor_input": {0: "batch_size"},
            "prediction":   {0: "batch_size"}
        }
    )
    
    # Save normalization params alongside the model
    with open(f"{label.lower()}_norm_params.json", "w") as f:
        json.dump(norm_params, f)
    
    print(f"Exported: {onnx_path}")
    print(f"Norm params: {label.lower()}_norm_params.json")


# Export all 3 models
export_to_onnx(input_model, "Input", input_norm)
export_to_onnx(seeing_model, "Seeing", seeing_norm)
export_to_onnx(temp_model, "Temp", temp_norm)
