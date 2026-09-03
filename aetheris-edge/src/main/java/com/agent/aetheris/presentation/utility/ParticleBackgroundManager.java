package com.agent.aetheris.presentation.utility;

import javafx.animation.AnimationTimer;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.paint.CycleMethod;
import javafx.scene.paint.RadialGradient;
import javafx.scene.paint.Stop;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ParticleBackgroundManager {

    private final Canvas particleCanvas;
    private final List<Particle> particles = new ArrayList<>();
    private final Random random = new Random();
    private AnimationTimer animationTimer;

    private static final Color ACCENT_BLUE = Color.web("#60a5fa");
    private static final Color ACCENT_EMERALD = Color.web("#34d399");
    private static final Color ACCENT_INDIGO = Color.web("#818cf8");
    private static final Color ACCENT_AMBER = Color.web("#fbbf24");

    private static final Color[] PARTICLE_COLORS = {
            ACCENT_BLUE, ACCENT_EMERALD, ACCENT_INDIGO, ACCENT_AMBER,
            Color.web("#38bdf8"), Color.web("#a78bfa"), Color.web("#f472b6")
    };

    private static final int PARTICLE_COUNT = 80;

    public ParticleBackgroundManager(Canvas particleCanvas) {
        this.particleCanvas = particleCanvas;
    }

    public void initParticles() {
        particles.clear();
        double w = particleCanvas.getWidth();
        double h = particleCanvas.getHeight();
        if (w <= 0) w = 700;
        if (h <= 0) h = 500;

        for (int i = 0; i < PARTICLE_COUNT; i++) {
            particles.add(new Particle(w, h));
        }
    }

    public void startAnimation() {
        stopAnimation(); // Ensure no multiple timers
        animationTimer = new AnimationTimer() {
            private long lastFrame = 0;

            @Override
            public void handle(long now) {
                if (lastFrame == 0) {
                    lastFrame = now;
                    return;
                }
                double delta = (now - lastFrame) / 1_000_000_000.0;
                lastFrame = now;
                update(delta);
                render();
            }
        };
        animationTimer.start();
    }
    
    public void stopAnimation() {
        if (animationTimer != null) {
            animationTimer.stop();
        }
    }

    private void update(double delta) {
        double w = particleCanvas.getWidth();
        double h = particleCanvas.getHeight();

        for (Particle p : particles) {
            p.x += p.vx * delta;
            p.y += p.vy * delta;

            p.phase += delta * p.phaseSpeed;
            p.x += Math.sin(p.phase) * 0.3 * delta * 60;

            p.opacityPhase += delta * p.opacitySpeed;
            p.currentOpacity = p.baseOpacity
                    + Math.sin(p.opacityPhase) * p.opacityAmplitude;
            p.currentOpacity = Math.max(0.03, Math.min(0.6, p.currentOpacity));

            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;
        }
    }

    private void render() {
        double w = particleCanvas.getWidth();
        double h = particleCanvas.getHeight();
        GraphicsContext gc = particleCanvas.getGraphicsContext2D();

        gc.clearRect(0, 0, w, h);

        RadialGradient bgGradient = new RadialGradient(
                0, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.6,
                false, CycleMethod.NO_CYCLE,
                new Stop(0, Color.web("#0f2847")),
                new Stop(0.5, Color.web("#0a1628")),
                new Stop(1, Color.web("#060e1a"))
        );
        gc.setFill(bgGradient);
        gc.fillRoundRect(0, 0, w, h, 40, 40);

        for (Particle p : particles) {
            Color c = p.color.deriveColor(0, 1, 1, p.currentOpacity);

            if (p.radius > 1.5) {
                RadialGradient glow = new RadialGradient(
                        0, 0, p.x, p.y, p.radius * 3,
                        false, CycleMethod.NO_CYCLE,
                        new Stop(0, p.color.deriveColor(0, 1, 1, p.currentOpacity * 0.3)),
                        new Stop(1, Color.TRANSPARENT)
                );
                gc.setFill(glow);
                gc.fillOval(p.x - p.radius * 3, p.y - p.radius * 3,
                        p.radius * 6, p.radius * 6);
            }

            gc.setFill(c);
            gc.fillOval(p.x - p.radius, p.y - p.radius,
                    p.radius * 2, p.radius * 2);
        }

        gc.setLineWidth(0.5);
        for (int i = 0; i < particles.size(); i++) {
            Particle a = particles.get(i);
            for (int j = i + 1; j < particles.size(); j++) {
                Particle b = particles.get(j);
                double dx = a.x - b.x;
                double dy = a.y - b.y;
                double dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    double lineOpacity = (1 - dist / 100) * 0.08;
                    gc.setStroke(ACCENT_BLUE.deriveColor(0, 1, 1, lineOpacity));
                    gc.strokeLine(a.x, a.y, b.x, b.y);
                }
            }
        }
    }

    private class Particle {
        double x, y;
        double vx, vy;
        double radius;
        Color color;
        double baseOpacity;
        double currentOpacity;
        double opacityAmplitude;
        double opacityPhase;
        double opacitySpeed;
        double phase;
        double phaseSpeed;

        Particle(double canvasW, double canvasH) {
            x = random.nextDouble() * canvasW;
            y = random.nextDouble() * canvasH;
            vx = (random.nextDouble() - 0.5) * 15;
            vy = (random.nextDouble() - 0.5) * 10;
            radius = 0.5 + random.nextDouble() * 2.5;
            color = PARTICLE_COLORS[random.nextInt(PARTICLE_COLORS.length)];
            baseOpacity = 0.1 + random.nextDouble() * 0.3;
            currentOpacity = baseOpacity;
            opacityAmplitude = 0.05 + random.nextDouble() * 0.15;
            opacityPhase = random.nextDouble() * Math.PI * 2;
            opacitySpeed = 0.5 + random.nextDouble() * 1.5;
            phase = random.nextDouble() * Math.PI * 2;
            phaseSpeed = 0.3 + random.nextDouble() * 0.8;
        }
    }
}
