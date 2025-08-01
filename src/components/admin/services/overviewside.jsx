import React from "react";
import { Bookmark } from "../../../icon";

function OverviewAside() {
  return (
    <div>
      <div className="bg-white p-3 rounded shadow">
        <button className="rounded-pill bg-warning py-2 px-4 border border-none">
          Featured
        </button>
        <button className="rounded-pill py-2 px-2 bg-white mx-5 border border-none">
          Most Recent
        </button>
        <button className="rounded-pill p-2 px-2 bg-white border border-none">
          Best Matches
        </button>
      </div>
      <div className="bg-white p-4 my-4">
        <div className="rounded p-3" style={{ background: "#f0d77f" }}>
          <div className="d-flex ">
            <h6>
              Remote Monitoring and <br /> Control
            </h6>
            <div className="ms-auto">
              <Bookmark />
            </div>
          </div>
          <p>
            This is a tweet. It can be long, or short. Depends on what you have
            to say. It can have some hashtags too.{" "}
          </p>
          <hr />
          <div className="d-flex align-items-center">
            <img src="images/bmwprofilepicture.png" width={"50px"} alt="#" />
            <p className="ms-3">West Land Oil</p>
            <button className="rounded-pill ms-auto bg-warning w-25 px-2 py-1 border border-none">
              View
            </button>
          </div>
        </div>
        <div className="my-4 rounded p-3" style={{ background: "#faf9f7" }}>
          <div className="d-flex ">
            <h6>
              Remote Monitoring and <br /> Control
            </h6>
            <div className="ms-auto">
              <Bookmark />
            </div>
          </div>
          <p>
            This is a tweet. It can be long, or short. Depends on what you have
            to say. It can have some hashtags too.{" "}
          </p>
          <hr />
          <div className="d-flex align-items-center">
            <img src="images/bmwprofilepicture.png" width={"50px"} alt="#" />
            <p className="ms-3">West Land Oil</p>
            <button className="rounded-pill ms-auto bg-warning w-25 px-2 py-1 border border-none">
              View
            </button>
          </div>
        </div>
        <div className="rounded p-3" style={{ background: "#faf9f7" }}>
          <div className="d-flex ">
            <h6>
              Remote Monitoring and <br /> Control
            </h6>
            <div className="ms-auto">
              <Bookmark />
            </div>
          </div>
          <p>
            This is a tweet. It can be long, or short. Depends on what you have
            to say. It can have some hashtags too.{" "}
          </p>
          <hr />
          <div className="d-flex align-items-center">
            <img src="images/bmwprofilepicture.png" width={"50px"} alt="#" />
            <p className="ms-3">West Land Oil</p>
            <button className="rounded-pill ms-auto bg-warning w-25 px-2 py-1 border border-none">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewAside;
