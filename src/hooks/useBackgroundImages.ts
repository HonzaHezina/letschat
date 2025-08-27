import { useEffect } from 'react';

const useBackgroundImages = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-background]') as NodeListOf<HTMLElement>;
    elements.forEach((element) => {
      const backgroundImage = element.getAttribute('data-background');
      if (backgroundImage) {
        element.style.backgroundImage = `url("${backgroundImage}")`;
      }
    });
  }, []);
};

export default useBackgroundImages;