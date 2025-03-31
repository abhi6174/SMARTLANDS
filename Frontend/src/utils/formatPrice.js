export const formatPrice = (price) => {
  // Handle undefined/null
  if (price === undefined || price === null) return "0.0000";
  
  // Convert to number if it's a string
  let numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle NaN cases
  if (isNaN(numericPrice)) {
    console.warn("Invalid price value:", price);
    return "0.0000";
  }

  // Check if this is likely a wei value (very large number)
  if (numericPrice > 1e15) { // 0.001 MATIC in wei
    numericPrice = numericPrice / 1e18; // Convert wei to MATIC
  }

  // Format with 4 decimal places
  return numericPrice.toFixed(4);
};