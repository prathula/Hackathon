import { useCallback } from "react";

export const useSoundEffects = () => {
  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (typeof window === "undefined") return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, []);

  const playMagicSpell = useCallback(() => {
    playSound(440, 0.3, "sine");
    setTimeout(() => playSound(554, 0.3, "sine"), 100);
    setTimeout(() => playSound(659, 0.4, "sine"), 200);
  }, [playSound]);

  const playSuccess = useCallback(() => {
    playSound(523, 0.2, "triangle");
    setTimeout(() => playSound(659, 0.2, "triangle"), 100);
    setTimeout(() => playSound(784, 0.3, "triangle"), 200);
  }, [playSound]);

  const playError = useCallback(() => {
    playSound(200, 0.3, "sawtooth");
    setTimeout(() => playSound(150, 0.4, "sawtooth"), 150);
  }, [playSound]);

  const playClick = useCallback(() => {
    playSound(800, 0.1, "square");
  }, [playSound]);

  const playWhoosh = useCallback(() => {
    playSound(1000, 0.2, "sine");
    setTimeout(() => playSound(500, 0.2, "sine"), 50);
  }, [playSound]);

  return {
    playMagicSpell,
    playSuccess,
    playError,
    playClick,
    playWhoosh,
  };
};
