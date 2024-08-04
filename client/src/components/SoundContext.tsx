import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface SoundContextProps {
  playRain: () => void;
  playTorch: () => void;
  stopTorch: () => void;
  playGnome: () => void;
  playCrow: () => void;
  playOwl: () => void;
  playChest: () => void;
  setHomeVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextProps | undefined>(undefined);

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider: React.FC = ({ children }) => {
  const audioRefWind = useRef<HTMLAudioElement>(null);
  const audioRefDoor = useRef<HTMLAudioElement>(null);
  const audioRefRain = useRef<HTMLAudioElement>(null);
  const audioRefTorch = useRef<HTMLAudioElement>(null);
  const audioRefGnome = useRef<HTMLAudioElement>(null);
  const audioRefCrow = useRef<HTMLAudioElement>(null);
  const audioRefOwl = useRef<HTMLAudioElement>(null);
  const audioRefChest = useRef<HTMLAudioElement>(null);
  const [isTorchPlaying, setIsTorchPlaying] = useState(false);
  const [isGnomePlaying, setIsGnomePlaying] = useState(false);
  const [volume, setVolume] = useState(localStorage.volume / 100); // Default volume is 1 (100%)

  useEffect(() => {
    const audioElementWind = audioRefWind.current;
    if (audioElementWind) {
      audioElementWind.loop = true;
      audioElementWind.volume = volume;
      audioElementWind.play();
    }

    return () => {
      if (audioElementWind) {
        audioElementWind.pause();
        audioElementWind.currentTime = 0;
      }
    };
  }, [volume]);

  useEffect(() => {
    const audioElementDoor = audioRefDoor.current;
    if (audioElementDoor) {
      audioElementDoor.loop = true;
      audioElementDoor.volume = volume;
      audioElementDoor.play();
    }

    return () => {
      if (audioElementDoor) {
        audioElementDoor.pause();
        audioElementDoor.currentTime = 0;
      }
    };
  }, [volume]);

  useEffect(() => {
    const audioElementRain = audioRefRain.current;
    if (audioElementRain) {
      if (audioElementRain.loop) {
        audioElementRain.volume = volume;
        audioElementRain.play();
      } else {
        audioElementRain.pause();
        audioElementRain.currentTime = 0;
      }
    }

    return () => {
      if (audioElementRain) {
        audioElementRain.pause();
        audioElementRain.currentTime = 0;
      }
    };
  }, [volume]);

  useEffect(() => {
    const audioElementTorch = audioRefTorch.current;
    if (audioElementTorch) {
      if (isTorchPlaying) {
        audioElementTorch.loop = true;
        audioElementTorch.volume = volume;
        audioElementTorch.play();
      } else {
        audioElementTorch.pause();
        audioElementTorch.currentTime = 0;
      }
    }

    return () => {
      if (audioElementTorch) {
        audioElementTorch.pause();
        audioElementTorch.currentTime = 0;
      }
    };
  }, [isTorchPlaying, volume]);

  useEffect(() => {
    const audioElementGnome = audioRefGnome.current;
    if (audioElementGnome) {
      if (isGnomePlaying) {
        audioElementGnome.loop = true;
        audioElementGnome.volume = volume;
        audioElementGnome.play();
      } else {
        audioElementGnome.pause();
        audioElementGnome.currentTime = 0;
      }
    }

    return () => {
      if (audioElementGnome) {
        audioElementGnome.pause();
        audioElementGnome.currentTime = 0;
      }
    };
  }, [isGnomePlaying, volume]);

  const playRain = () => {
    const audioElementRain = audioRefRain.current;
    if (audioElementRain) {
      audioElementRain.loop = true;
      audioElementRain.volume = volume;
      audioElementRain.play();
    }
  };

  const playTorch = () => {
    setIsTorchPlaying(true);
  };

  const stopTorch = () => {
    setIsTorchPlaying(false);
  };

  const playGnome = () => {
    setIsGnomePlaying(true);
  };

  const playCrow = () => {
    const audioElementCrow = audioRefCrow.current;
    if (audioElementCrow) {
      audioElementCrow.loop = true;
      audioElementCrow.volume = volume;
      audioElementCrow.play();
    }
  };

  const playOwl = () => {
    const audioElementOwl = audioRefOwl.current;
    if (audioElementOwl) {
      audioElementOwl.loop = true;
      audioElementOwl.volume = volume;
      audioElementOwl.play();
    }
  };

  const playChest = () => {
    const audioElementChest = audioRefChest.current;
    if (audioElementChest) {
      audioElementChest.loop = true;
      audioElementChest.volume = volume;
      audioElementChest.play();
    }
  };

  const updateVolume = (volume: number) => {
    setVolume(volume);
  };

  return (
    <SoundContext.Provider value={{ playRain, playTorch, stopTorch, playGnome, playCrow, playOwl, playChest, setHomeVolume: updateVolume }}>
      {children}
      <audio ref={audioRefWind} src="/homeWind.mp3" />
      <audio ref={audioRefDoor} src="/homeDoor.mp3" />
      <audio ref={audioRefRain} src="/homeRain.mp3" />
      <audio ref={audioRefTorch} src="/homeTorch.mp3" />
      <audio ref={audioRefGnome} src="/homeGnome.mp3" />
      <audio ref={audioRefCrow} src="/homeCrow.mp3" />
      <audio ref={audioRefOwl} src="/homeOwl.mp3" />
      <audio ref={audioRefChest} src="/homeChest.mp3" />
    </SoundContext.Provider>
  );
};
