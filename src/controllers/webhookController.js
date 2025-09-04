const WebhookController = (req, res) => {
	const mode = req.query['hub.mode']
	const token = req.query['hub.verify_token']
	const challenge = req.query['hub.challenge']
	const VERIFY_TOKEN = process.env.VERIFY_TOKEN

	if (mode === 'subscribe' && token === VERIFY_TOKEN) {
		console.log('Webhook Connected Successfully')
		res.status(200).send(challenge)
	} else {
		console.log('Verification Failed')
		res.status(403).send('Verification Failed')
	}
}

export default WebhookController
