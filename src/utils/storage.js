export const saveToken = (token) => {
  localStorage.setItem("PharmacyAdmin", token);
};

export const getToken = () => {
  return localStorage.getItem("PharmacyAdmin");
};

export const removeToken = () => {
  localStorage.removeItem("PharmacyAdmin");
};
