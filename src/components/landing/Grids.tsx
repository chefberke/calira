import React from "react";

function Grids() {
  return (
    <div className="w-full h-full pt-36">
      <div className="grid grid-cols-2 grid-rows-2 gap-6 w-full h-full">
        <div className="col-span-2 w-full h-80 bg-neutral-100 rounded-xl shadow-sm"></div>
        <div className="row-start-2 w-full h-72 bg-neutral-100 rounded-xl shadow-sm "></div>
        <div className="row-start-2 w-full h-72 bg-neutral-100 rounded-xl shadow-sm"></div>
      </div>
    </div>
  );
}

export default Grids;
