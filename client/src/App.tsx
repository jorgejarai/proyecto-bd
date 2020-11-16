import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { setAccessToken } from "./accessToken";
import { Routes } from "./Routes";
import Loader from "react-loader-spinner";
import "./App.scss";

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include",
    }).then(async (res) => {
      const { accessToken } = await res.json();
      setAccessToken(accessToken);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loader type="Puff" color="#00bfff" height={100} width={100} />;
  }

  return <Routes />;
};
