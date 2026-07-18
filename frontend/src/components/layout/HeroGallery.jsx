import { useState, useEffect } from "react";
import { TOPIC_IMAGES } from "../../constants/catalogs";
import "../../styles/hero-gallery.css";

const HERO_IMAGES = Object.values(TOPIC_IMAGES);

export default function HeroGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-gallery">
      {HERO_IMAGES.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`NGO Topic context ${index + 1}`}
          className={`hero-gallery__image ${index === currentIndex ? "hero-gallery__image--active" : ""
            }`}
        />
      ))}
      <div className="hero-gallery__indicators">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            className={`hero-gallery__indicator ${index === currentIndex ? "hero-gallery__indicator--active" : ""
              }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{ width: "8px", height: "8px", margin: "0 2px" }}
          />
        ))}
      </div>
    </div>
  );
}
