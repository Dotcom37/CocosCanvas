import React from "react";
import { useParams } from "react-router";

const ShareLink = ({ setShowGenerate }) => {
  const { roomid } = useParams();

  const inviteLink = `${window.location.origin}/canvas/${roomid}`;

  return (
    <form className="absolute inset-0 z-10">
      <div className="relative z-10 w-[500px] rounded-3xl bg-white p-6 shadow-xl">

        <button
          onClick={() => setShowGenerate(false)}
          type="button"
          className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold">Generate a link</h1>

        <div className="mt-6 flex flex-col gap-8">

          <input
            className="rounded p-3 shadow-inner bg-white"
            type="text"
            value={inviteLink}
            readOnly
          />

          <button
            className="rounded-lg bg-black p-3 text-white hover:bg-gray-800"
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteLink)}
          >
            Copy Link
          </button>

        </div>
      </div>
    </form>
  );
};

export default ShareLink;