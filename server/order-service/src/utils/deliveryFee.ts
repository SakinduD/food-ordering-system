const deliveryFee =  ( distance: number ): number => {
    // Base fee for the first 5 km
    const baseFee = 50;

    // Additional fee for every km after the first 5 km
    const additionalFee = Math.max(0, distance - 5) * 10;

    // Total delivery fee
    return baseFee + additionalFee;
}

export default deliveryFee;