// Hum ek asyncHandler function define kar rahe hain jo ek requestHandler function ko lekar aata hai.
const asyncHandler = (requestHandler) => {
    // Yeh function ek naya function return karta hai jo express middleware ki tarah kaam karta hai.
    return (req, res, next) => {
        // Promise.resolve se hum ensure karte hain ki requestHandler function ek Promise return kare.
        Promise.resolve(requestHandler(req, res, next))
        // Agar Promise resolve hota hai, toh hum kisi error ka intezaar nahi karte aur agla middleware ko call karte hain.
        .catch((err) => next(err))
    }
}

// Hum asyncHandler ko export karte hain taki dusre files mein iska use ho sake.
export { asyncHandler }








/*basic part to understand these code
 const asyncHandler = () => { }
 const asyncHandler = (func) => {
     async () => {

     }
 } */


// const asyncHandler = (fn) = async (req,res,next) =>{
//      try {
//         await fn(req,res,next);
//      } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//      }
// }



//example how these implement

// const getUser = async (req, res, next) => {
//     // Kuch logic yahan likhein
// };

// // asyncHandler ke sath getUser function ka use
// app.get('/user', asyncHandler(getUser));