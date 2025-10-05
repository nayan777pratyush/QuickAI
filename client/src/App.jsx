import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitles from './pages/BlogTitles'
import GenerateImages from './pages/GenerateImages'
import GenerateVideo from './pages/GenerateVideo'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import PresentationMaker from './pages/PresentationMaker'
import StudyAssistant from './pages/StudyAssistant'
import Community from './pages/Community'
import { useAuth } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'

const App = () => {

  // const { getToken } = useAuth()
  // useEffect(() => {
  //   getToken().then((token) => console.log(token));
  // },[])

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/ai' element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='write-article' element={<WriteArticle/>}/>
          <Route path='blog-titles' element={<BlogTitles/>}/>
          <Route path='generate-image' element={<GenerateImages/>}/>
          <Route path='generate-video' element={<GenerateVideo/>}/>
          <Route path='remove-background' element={<RemoveBackground/>}/>
          <Route path='remove-object' element={<RemoveObject/>}/>
          <Route path='review-resume' element={<ReviewResume/>}/>
          <Route path='presentation-maker' element={<PresentationMaker/>}/>
          <Route path='study-assistant' element={<StudyAssistant/>}/>
          <Route path='community' element={<Community/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App