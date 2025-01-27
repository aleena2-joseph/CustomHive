import Img1 from "../../assets/Img/TABLE-TOP.jpg";
import Img2 from "../../assets/Img/lampp.jpg";
import Img3 from "../../assets/Img/Carictures.jpg";
import Img4 from "../../assets/Img/hampers.jpg";
import Img5 from "../../assets/Img/puzzle.jpg";
import Img6 from "../../assets/Img/crystal.webp";
import Img7 from "../../assets/Img/keychain.avif";
import { FaStar } from "react-icons/fa";

const ProductsData = [
  {
    id: 1,
    img: Img1,
    title: "Table Top",
    rating: 5.0,
    color: "white",
    aosDelay: "0",
  },
  {
    id: 2,
    img: Img2,
    title: "Lamp",
    rating: 4.5,
    color: "red",
    aosDelay: "200",
  },
  {
    id: 3,
    img: Img3,
    title: "Carictures",
    rating: 4.0,
    color: "blue",
    aosDelay: "400",
  },
  {
    id: 4,
    img: Img4,
    title: "Hampers",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 5,
    img: Img5,
    title: "Photo Puzzles",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 6,
    img: Img6,
    title: "3D Crystals",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 7,
    img: Img7,
    title: "Key Chain",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 8,
    img: Img4,
    title: "Hampers",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 9,
    img: Img4,
    title: "Hampers",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 10,
    img: Img4,
    title: "Hampers",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 11,
    img: Img4,
    title: "Hampers",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
  {
    id: 12,
    img: Img4,
    title: "Hampers",
    rating: 4.5,
    color: "green",
    aosDelay: "600",
  },
];

const Products = () => {
  return (
    <div className="mt-14 mb-12">
      <div className="container">
        {/* Header section */}
        <div
          className="text-center mb-10 max-w-[600px]
        mx-auto"
        >
          <p data-aos="fade-up" className="text-sm text-primary">
            Top selling products
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            products
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            jbhfjhsbfvfsdbd fvfbvk fhvfduvh
          </p>
        </div>
        {/* body section */}
        <div>
          <div
            className="grid grid-cols-1 sm:grid-cols-3
          md:grid-cols-4 lg:grid-cols-4 place-items-center
          gap-20"
          >
            {/* card section */}
            {ProductsData.map((data) => (
              <div
                data-aos="fade-up"
                data-aos-delay={data.aosDelay}
                key={data.id}
                className="space-y-3"
              >
                <img
                  src={data.img}
                  alt=""
                  className="h-[220px] w-[150px]
                object-cover rounded-md"
                />
                <div>
                  <h3 className="font-semibold">{data.title}</h3>
                  <p className="text-sm text-gray-600">{data.color}</p>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{data.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
