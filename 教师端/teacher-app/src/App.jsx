import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Courseware from './pages/Courseware.jsx'
import CoursewareImport from './pages/CoursewareImport.jsx'
import CoursewareEditor from './pages/CoursewareEditor.jsx'
import DictationConfig from './pages/DictationConfig.jsx'
import QuizConfig from './pages/QuizConfig.jsx'
import StaticToInteractive from './pages/StaticToInteractive.jsx'
import Homework from './pages/Homework.jsx'
import HomeworkSelect from './pages/HomeworkSelect.jsx'
import HomeworkLayout from './pages/HomeworkLayout.jsx'
import QuestionBank from './pages/QuestionBank.jsx'
import HomeworkReview from './pages/HomeworkReview.jsx'
import ErrorAnalysis from './pages/ErrorAnalysis.jsx'
import LectureGen from './pages/LectureGen.jsx'
import Analytics from './pages/Analytics.jsx'
import SchoolResource from './pages/SchoolResource.jsx'

export default function App() {
  return (
    <Routes>
      {/* 全屏页面：编辑器类，不带通用 Layout */}
      <Route path="/editor" element={<CoursewareEditor />} />
      <Route path="/panel" element={<Navigate to="/editor" replace />} />
      <Route path="/static-interactive" element={<StaticToInteractive />} />

      {/* 通用 Layout 页面 */}
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/courseware" element={<Courseware />} />
        <Route path="/courseware/import" element={<CoursewareImport />} />
        <Route path="/dictation" element={<DictationConfig />} />
        <Route path="/quiz" element={<QuizConfig />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/homework/select" element={<HomeworkSelect />} />
        <Route path="/homework/layout" element={<HomeworkLayout />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/review" element={<HomeworkReview />} />
        <Route path="/error-analysis" element={<ErrorAnalysis />} />
        <Route path="/lecture-gen" element={<LectureGen />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/school-resource" element={<SchoolResource />} />
      </Route>
    </Routes>
  )
}
