import app from "./app";

app.get("/", (req, res)=>{
    res.send("Hello, setup")
});

const PORT = process.env.PORT || 5173;

app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`))