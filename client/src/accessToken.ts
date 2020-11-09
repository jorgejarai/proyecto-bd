let accessToken: any = "";

export const setAccessToken = (token: any) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};
