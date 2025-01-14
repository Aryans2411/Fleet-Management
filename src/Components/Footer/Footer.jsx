import React from "react";

const Footer = () => {
  return (
    <div className="py-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 bg-gray-100 text-sm mt-24">
      {/* TOP */}
      <div className="flex flex-col md:flex-row justify-between gap-24">
        {/* LEFT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8">
          <div className="text-xl tracking-wide">Fleeto</div>

          <p>Address</p>
          <span className="font-semibold">Email</span>
          <span className="font-semibold">Phone Number</span>
          <div className="flex gap-6">
            <img src="/meta.png" alt="Meta" width={16} height={16} />
            <img src="/instagram.png" alt="Instagram" width={16} height={16} />
            <img src="/youtube.png" alt="YouTube" width={16} height={16} />
            <img src="/pinterest.png" alt="Pinterest" width={16} height={16} />
            <img src="/x.png" alt="X" width={16} height={16} />
          </div>
        </div>
        {/* CENTER */}
        <div className="hidden lg:flex justify-between w-1/2">
          <div className="flex flex-col justify-between">
            <h1 className="font-medium text-lg">COMPANY</h1>
            <div className="flex flex-col gap-6">
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Affiliates</a>
              <a href="#">Blog</a>
              <a href="#">Contact Us</a>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <h1 className="font-medium text-lg">SHOP</h1>
            <div className="flex flex-col gap-6">
              <a href="#">New Arrivals</a>
              <a href="#">Accessories</a>
              <a href="#">Men</a>
              <a href="#">Women</a>
              <a href="#">All Products</a>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <h1 className="font-medium text-lg">HELP</h1>
            <div className="flex flex-col gap-6">
              <a href="#">Customer Service</a>
              <a href="#">My Account</a>
              <a href="#">Find a Store</a>
              <a href="#">Legacy and Privacy</a>
              <a href="#">Gift Card</a>
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-full md:w-1/2 lg:w-1/4 flex flex-col gap-8">
          <h1 className="font-medium text-lg">SUBSCRIBE</h1>
          <p>
            Be the first to get the latest news about trends, promotions, and
            much more!
          </p>
          <div className="flex">
            <input
              type="text"
              name="Email Address"
              className="p-4 w-3/4"
              placeholder="Enter your email"
            />
            <button className="w-1/4 bg-hub text-white">JOIN</button>
          </div>
          <span className="font-semibold">Secure Payments</span>
          <div className="flex justify-between">
            <img src="/discover.png" alt="Discover" width={40} height={20} />
            <img src="/skrill.png" alt="Skrill" width={40} height={20} />
            <img src="/paypal.png" alt="PayPal" width={40} height={20} />
            <img
              src="/mastercard.png"
              alt="MasterCard"
              width={40}
              height={20}
            />
            <img src="/visa.png" alt="Visa" width={40} height={20} />
          </div>
        </div>
      </div>
      {/* BOTTOM */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-16">
        <div>© 2024 Hub Shop</div>
        <div className="flex flex-col gap-8 md:flex-row">
          <div>
            <span className="text-gray-500 mr-4">Language</span>
            <span className="font-medium">India | English</span>
          </div>
          <div>
            <span className="text-gray-500 mr-4">Currency</span>
            <span className="font-medium">Rupees IND</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
