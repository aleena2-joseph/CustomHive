import Img1 from "../../assets/Img/TABLE-TOP.jpg";
import Img2 from "../../assets/Img/lampp.jpg";
import Img3 from "../../assets/Img/Carictures.jpg";
import Img4 from "../../assets/Img/hampers.jpg";
import Img5 from "../../assets/Img/puzzle.jpg";
import Img6 from "../../assets/Img/crystal.webp";
import Img7 from "../../assets/Img/keychain.avif";
import { FaStar, FaRegHeart, FaCartPlus, FaShoppingBag } from "react-icons/fa"; // Importing icons

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
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">
            Top selling products
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Products
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Check out our top-selling products!
          </p>
        </div>

        {/* Body section */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 place-items-center gap-20">
            {/* Card section */}
            {ProductsData.map((data) => (
              <div
                data-aos="fade-up"
                data-aos-delay={data.aosDelay}
                key={data.id}
                className="space-y-3 relative"
              >
                {/* Product Image */}
                <img
                  src={data.img}
                  alt={data.title}
                  className="h-[220px] w-[150px] object-cover rounded-md"
                />

                {/* Heart Icon (blank heart) */}
                <div className="absolute top-2 right-2">
                  <FaRegHeart className="text-red-500 cursor-pointer" />
                </div>

                {/* Product Title and Rating */}
                <div>
                  <h3 className="font-semibold">{data.title}</h3>
                  <p className="text-sm text-gray-600">{data.color}</p>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{data.rating}</span>
                  </div>
                </div>

                {/* Buttons: Heart, Add to Cart, and Order */}
                <div className="flex gap-3 mt-3">
                  <button className="bg-transparent text-red-500 hover:text-red-700 p-1 text-lg rounded-full border-2 border-red-500 hover:bg-red-100">
                    <FaRegHeart />
                  </button>
                  <button className="bg-blue-500 text-white hover:bg-blue-600 p-1 text-lg rounded-full">
                    <FaCartPlus />
                  </button>
                  <button className="bg-green-500 text-white hover:bg-green-600 p-1 text-lg rounded-full">
                    <FaShoppingBag />
                  </button>
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
