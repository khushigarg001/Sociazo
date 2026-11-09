import app from './server.js'

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000')
    console.log("CLERK SECRET EXISTS:", !!process.env.CLERK_SECRET_KEY)
})