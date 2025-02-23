const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())

app.post('/api/checkLicense', async (req, res) => {
  try {
    const soapRequest = req.body.soapRequest

    const response = await axios.post(
      'https://ws2.ahpra.gov.au/pie/svc/PractitionerRegistrationSearch/2.0.0/FindRegistrationService.svc',
      soapRequest,
      {
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8'
        }
      }
    )

    res.send(response.data)
  } catch (error) {
    res.status(500).send('Error checking license')
  }
})

app.listen(3000, () => console.log('Proxy server running on port 3000'))
