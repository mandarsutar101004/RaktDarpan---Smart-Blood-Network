import React from "react";
import Carousel from "react-bootstrap/Carousel"; // <-- Add this
import "./HeroSection.css";
import sbn2 from "../Photos/sbn2_padded.png";
import sbn4 from "../Photos/sbn4_padded.png";
import sbn5 from "../Photos/sbn5_padded.png"; // <-- Import your images

const HeroSection = () => {
  return (
    <Carousel className="carousel-container">
      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={sbn2}
          alt="First slide"
          style={{ maxHeight: "400px", objectFit: "cover" }} // <-- Added styling
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={sbn5}
          alt="Second slide"
          style={{ maxHeight: "400px", objectFit: "cover" }} // <-- Added styling
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={sbn4}
          alt="Third slide"
          style={{ maxHeight: "400px", objectFit: "cover" }} // <-- Added styling
        />
      </Carousel.Item>
    </Carousel>
  );
};

export default HeroSection;
