import Img1 from "../../assets/Img/Frame.webp";
import Img2 from "../../assets/Img/sculptures.jpg";
import Img3 from "../../assets/Img/cake.png";

import { FaStar } from "react-icons/fa6";
const ProductsData = [
  {
    id: 1,
    img: Img1,
    title: "Frame",
    description:
      "Capture and cherish your special moments with our beautifully crafted, personalized frames",
  },
  {
    id: 2,
    img: Img2,
    title: "Sculpture",
    description:
      "Our custom sculptures are meticulously designed to bring your vision to life.",
  },
  {
    id: 3,
    img: Img3,
    title: "Cake",
    description:
      "Order your customized cake today and make every occasion unforgettable",
  },
];

const TopProducts = () => {
  return (
    <div>
      <div className="container">
        {/* Header Section */}
        <div className="text-left mb-24">
          <p data-aos="fade-up" className="text-sm text-primary">
            Top Rated products
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            best products
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            jbhfjhsbfvfsdbd fvfbvk fhvfduvh
          </p>
        </div>

        {/* Body section */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2
        md:grid-cols-3 gap-20 md:gap-5 place-items-center"
        >
          {ProductsData.map((data, index) => (
            <div
              key={index}
              data-aos="zoom-in"
              className="
            rounded-2xl bg-white hover:bg-black/80 hover:text-white
            relative shadow-xl duration-300 group max-w-[300px]
            "
            >
              {/* image section */}
              <div className="h-[100px]">
                <img
                  src={data.img}
                  alt=""
                  className="max-w-[140px] block mx-auto
                  transform -translate-y-20 group-hover:scale-105 duration-300
                  drop-shadow-md"
                />
              </div>
              {/* details section */}
              <div className="p-4 text-center">
                {/* star section */}
                <div className="w-full flex items-center justify-center">
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                </div>
                <h1 className="text-xl font-bold">{data.title}</h1>
                <p
                  className="text-gray-500 
                group-hover:text-white duration-300
                text-sm line-clamp-2"
                >
                  {data.description}
                </p>
                <button
                  className="bg-primary hover:scale-105
                duration-300 text-white py-1 px-4 rounded-full
                mt-4 group-hover:bg-white
                group-hover:text-primary"
                  // onClick={handleOrderPopup}
                >
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopProducts;
