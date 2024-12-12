import { app } from './app'

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
})
