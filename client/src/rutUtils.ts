const calculateDv = (rut: number) => {
  const rutArr = rut.toString().split('').reverse();

  let acc = 0;
  for (let i = 0; i < rutArr.length; i++) {
    acc += parseInt(rutArr[i]) * (2 + (i % 6));
  }

  const modulo = 11 - (acc % 11);
  let dv = '';
  switch (modulo) {
    case 10:
      dv = 'K';
      break;
    case 11:
      dv = '0';
      break;
    default:
      dv = modulo.toString();
      break;
  }

  return dv;
};

const rutRegex = /^[0-9]+-[0-9kK]$/;

export const validateRut = (rut: string) => {
  if (!rutRegex.test(rut)) {
    console.error("Doesn't match with regex");

    return 'Invalid RUT';
  }

  const rutNumber = parseInt(rut.slice(0, -2))!;
  const rutDv = rut.slice(rut.length - 1).toUpperCase();

  if (rutDv !== calculateDv(rutNumber)) {
    console.error(
      `Invalid DV (is ${rutDv}, should be ${calculateDv(rutNumber)})`
    );
    return 'Invalid RUT';
  }

  return undefined;
};
