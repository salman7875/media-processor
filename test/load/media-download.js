"use strict";

import autocannon from "autocannon";

autocannon(
  {
    url: "http://localhost:3000/media?q=https://www.youtube.com/shorts/8PUGamUj5xQ",
    connections: 10,
    pipelining: 1,
    duration: 10,
  },
  console.log,
);
