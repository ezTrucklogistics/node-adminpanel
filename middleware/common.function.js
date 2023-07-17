
exports.generate_customer_Id = () => {

      return  Math.floor(Math.random() * 900) + 100;
}

exports.generate_otp = () => {

    return  Math.floor(Math.random() * 1000000 + 1);
}



