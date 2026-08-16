import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import VideoCall from "../components/VideoCall";
import API from "../api/axios";

export default function VideoCallPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("with");
  const [partner, setPartner] = useState(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isCaller = currentUser.role === "mentor"; // Mentor defaults to caller

  useEffect(() => {
    if (partnerId) {
      API.get(`/users/${partnerId}`)
        .then((res) => setPartner(res.data.user))
        .catch(() => {});
    }
  }, [partnerId]);

  return (
    <VideoCall
      roomId={roomId}
      isCaller={isCaller}
      partnerName={partner?.name || "Peer"}
      onEndCall={() => navigate("/my-sessions")}
    />
  );
}
