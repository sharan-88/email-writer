import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box, Container, Typography, TextField, MenuItem,FormControl,InputLabel, Select, Button, CircularProgress } from '@mui/material'
import axios from 'axios';


function App() {
  const [emailContent, setEmailContent] = useState("")
  const[name,setName]=useState("name")
  const [tone, setTone] = useState("")
  const [generatedReplay, setGeneratedReplay] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit  = async(e)=>{
    setLoading(true)
    setError("")
    try{
      const response =await axios.post("http://localhost:8080/api/email/generate", {
        emailContent,
        tone,
        name
      });
      
      setGeneratedReplay(typeof response.data === "string" ? response.data : JSON.stringify(response.data,null))

    }catch(error){
      setError("An error occurred while generating the reply.",error.message)
      console.log(error)
    }finally{
      setLoading(false)
    }

  };

  return (
    <>
      <Container maxWidth="md" sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Email Reply Generator
        </Typography>

        <Box sx={{ mx: 3 }}>
          <TextField
            fullWidth
            label="Email Content"
            multiline
            rows={6}
            value={emailContent||''}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{mb:2}}
          />
          <TextField
            fullWidth
            label="Name"
            placeholder='Enter your beautiful name!🧐'
            rows={6}
            value={name||''}
            onChange={(e) => setName(e.target.value)}
            sx={{mb:2}}
          />
          <FormControl  fullWidth sx={{mb:2}}>
            <InputLabel>Tone(Optional)</InputLabel>
            <Select
              value={tone||''}
              label ={"tone(optional)"}
              onChange={(e) => setTone(e.target.value)}
              sx={{mb:2}}
            >
              <MenuItem value="friendly">Friendly</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>

            </Select>
          </FormControl>

          <Button
             variant ="contained"
             onClick={handleSubmit}
             disabled={!emailContent || loading}
             fullWidth>
            {loading ? <CircularProgress size ={24}/> : "Generate Reply"}
          </Button>
          </Box>
          {error &&(
            <Typography variant="body1" color="error" align="center" sx={{mt:2}}>
              {error}
            </Typography>
          )}

          {generatedReplay &&(
            <Box sx={{ mx: 3 }}>
              <Typography variant='h6' gutterBottom>
                Generated Reply:
              </Typography>
              <TextField fullWidth multiline rows={6} variant='outlined'
                value={generatedReplay||""} sx={{mt:2}}>
              </TextField>
              <Button variant='outlined'  sx={{mb:2}}
              onClick = {()=>navigator.clipboard.writeText(generatedReplay)}>
                copy 
              </Button>

            </Box>
            
          )}
        
      </Container>
    </>
  )
}

export default App