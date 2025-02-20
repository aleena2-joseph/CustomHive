import { FaCaretDown, FaCartShopping } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import logo from "../Navbar/logo.png";
import { Link } from "react-router-dom";

const Menu = [
  {
    id: 1,
    name: "Birthday",
    link: "/#",
  },
  {
    id: 2,
    name: "Occasions",
    link: "/#",
  },
  {
    id: 3,
    name: "Anniversary",
    link: "/#",
  },
  {
    id: 4,
    name: "Chocolates",
    link: "/#",
  },
  {
    id: 5,
    name: "Cakes",
    link: "/#",
  },
  {
    id: 6,
    name: "Hampers",
    link: "/#",
  },
  {
    id: 7,
    name: "Frames",
    link: "/#",
  },
];

const DropdownLinks = [
  {
    id: 1,
    name: "Birthday",
    link: "/#",
  },
  {
    id: 2,
    name: "New Arrivals",
    link: "/#",
  },
  {
    id: 3,
    name: "Best Sellers",
    link: "/#",
  },
];

const Navbar = () => {
  return (
    <div
      className="shadow-md bg-white duration-200
    relative z-40"
    >
      {/* Upper Navbar */}
      <div className="bg-primary/40 py-2">
        <div
          className="container flex justify-between
        items-center "
        >
          <div>
            <a
              href="#"
              className="font-bold 
            text-2xl sm:text-3xl flex gap-2"
            >
              <img src={logo} alt="logo" className="w-10 uppercase" />
              CustomHive
            </a>
          </div>
          {/* search bar */}
          <div className="flex justify-between items-center gap-4 ">
            <div
              className="relative group hidden
            sm:block"
            >
              <input
                type="text"
                placeholder="Search"
                className="w-[200px] sm:w-[200px]
              group-hover:w-[300px]
              transition-all duration-300
              rounded-full border
              border-gray-300 px-2 py-1 
              focus:outline-none focus:border-1
              focus:border-primary
              "
              />
              <IoMdSearch
                className="text-gray-500 group-hover:text-primary absolute
              top-1/2 -translate-y-1/2 right-3"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Link to="/Login">
              <button className="bg-primary text-white py-1 px-4 rounded-full">
                Login
              </button>
            </Link>
            <Link to="/Signup">
              <button className="bg-secondary text-white py-1 px-4 rounded-full">
                Signup
              </button>
            </Link>
          </div>
          {/* order button */}
          <button>
            <a href="/login"></a>
          </button>
          <button
            onClick={() => alert("Ordering not available yet ")}
            className="bg-gradient-to-r from-primary to-secondary transition-all duration-200
          text-white py-1 px-4 rounded-full flex
          items-center gap-3 group"
          >
            <span className="group-hover:block hidden transition-all duration-200">
              order
            </span>
            <FaCartShopping
              className="text-xl text-white drop-shadow-sm 
            cursor-pointer"
            />
          </button>
        </div>
      </div>
      {/* Lower Navbar */}
      <div className="flex justify-center">
        <ul
          className="sm:flex hidden items-center
        gap-4"
        >
          {Menu.map((data) => (
            <li key={data.id}>
              <a
                href={data.link}
                className="inline-block px-4 
              hover:text-primary duration-200"
              >
                {data.name}
              </a>
            </li>
          ))}
          {/* simple dropdown and lists */}
          <li className="group relative cursor-pointer">
            <a
              href="#"
              className="flex items-center gap-[2px]
              py-2"
            >
              Trending
              <span>
                <FaCaretDown
                  className="transitionn-all
                duration-200
                group-hover:rotate-180"
                />
              </span>
            </a>
            <div
              className="absolute z-[9999]
            hidden group-hover:block w-[150px] rounded-md
            bg-white p-2 text-black shadow-md"
            >
              <ul>
                {DropdownLinks.map((data) => (
                  <li key={data.id}>
                    <a
                      href={data.link}
                      className="inline-block w-full rounded-md p-2 hover:bg-primary/20"
                    >
                      {data.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
