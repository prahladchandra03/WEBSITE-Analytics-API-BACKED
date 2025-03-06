// // Function to generate JWT token
// function generateToken(user) {
//     // Ensure you are passing the correct payload and using your JWT_SECRET
//     return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
//       expiresIn: '1h' // Token will expire in 1 hour
//     });
//   }
  
//   module.exports = generateToken;