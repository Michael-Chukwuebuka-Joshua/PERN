import express from "express"
import { ENV } from "./config/env"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express"

import userRoutes from "./routes/userRoutes"
import productRoutes from "./routes/productRoutes"
import commentRoutes from "./routes/commentRoutes"

const app = express()
app.use(cors({origin: ENV.FRONTEND_URL}))
app.use(clerkMiddleware()) // auth object attached to the req
app.use(express.json()) // parse JSON request bodies
app.use(express.urlencoded({extended: true})) //parses form data (like HTML forms)

app.get("/", (req, res) => {
    res.json({success: true})
})

app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/comments", commentRoutes)

app.listen(ENV.PORT, () => console.log(`Server running on PORT ${ENV.PORT}`))