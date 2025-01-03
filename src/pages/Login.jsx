import { useState } from 'react'
import { Paper, TextInput, PasswordInput, Button, Title, Text, Container } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Try to sign in first
      const { error: signInError } = await signIn({ email, password })
      
      // If no user exists, create one (first-time setup)
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await signUp({ email, password })
        if (signUpError) throw signUpError
      } else if (signInError) {
        throw signInError
      }

      navigate('/pos')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Title align="center">Welcome to JJ POS</Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Sign in or create your account
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="you@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Text color="red" size="sm" mt="sm">
              {error}
            </Text>
          )}
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Sign in / Sign up
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
