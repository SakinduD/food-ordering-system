const deliveryFee =  ( distance: number ): number => {
    // Base fee for the first 2 km
    const baseFee = 100;

    // Additional fee for every km after the first 2 km
    const additionalFee = Math.max(0, distance - 2) * 30;

    // Total delivery fee
    return baseFee + additionalFee;
}

export default deliveryFee;