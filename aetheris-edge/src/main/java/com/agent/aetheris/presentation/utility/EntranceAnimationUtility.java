package com.agent.aetheris.presentation.utility;

import javafx.animation.FadeTransition;
import javafx.animation.ParallelTransition;
import javafx.animation.TranslateTransition;
import javafx.scene.Node;
import javafx.util.Duration;

public class EntranceAnimationUtility {

    public static void animateBottomToTop(Node node, double delaySeconds) {
        if (node == null) return;
        node.setTranslateY(30);
        FadeTransition ft = new FadeTransition(Duration.seconds(0.8), node);
        ft.setToValue(1);
        TranslateTransition tt = new TranslateTransition(Duration.seconds(0.8), node);
        tt.setToY(0);
        ParallelTransition pt = new ParallelTransition(node, ft, tt);
        pt.setDelay(Duration.seconds(delaySeconds));
        pt.play();
    }

    public static void animateRightToLeft(Node node, double delaySeconds) {
        if (node == null) return;
        node.setTranslateX(30);
        FadeTransition ft = new FadeTransition(Duration.seconds(0.8), node);
        ft.setToValue(1);
        TranslateTransition tt = new TranslateTransition(Duration.seconds(0.8), node);
        tt.setToX(0);
        ParallelTransition pt = new ParallelTransition(node, ft, tt);
        pt.setDelay(Duration.seconds(delaySeconds));
        pt.play();
    }
}
