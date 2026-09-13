import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import LessonPage from './components/LessonPage'
import FeaturePage from './components/FeaturePage'
import DownloadSection from './components/DownloadSection'
import SettingsPage from './components/SettingsPage'
import CallLogPage from './components/CallLogPage'
import PlaygroundPage from './components/PlaygroundPage'
import LabPage from './components/LabPage'
import HomePage from './components/HomePage'
import ModulePage from './components/ModulePage'
import CompletionPage from './components/CompletionPage'
import CapstonePage from './components/CapstonePage'
import NotFoundPage from './components/NotFoundPage'
import { features } from './data/features'
import { lessons } from './data/lessons'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="introduction" element={<Navigate to="/" replace />} />
          {/* Learning path module routes */}
          <Route path="learning-path/:moduleId" element={<ModulePage />} />
          {/* Lesson-based routes - main curriculum */}
          {lessons.map((l) => (
            <Route
              key={l.id}
              path={`lesson/${l.id}`}
              element={<LessonPage lesson={l} />}
            />
          ))}
          {/* Feature-based routes - backed by actual feature data */}
          {features.map((feature) => (
            <Route
              key={`feature-${feature.id}`}
              path={`feature/${feature.id}`}
              element={<FeaturePage feature={feature} />}
            />
          ))}
          <Route path="download" element={<DownloadSection />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="call-log" element={<CallLogPage />} />
          <Route path="playground" element={<PlaygroundPage />} />
          <Route path="lab" element={<LabPage />} />
          <Route path="capstone" element={<CapstonePage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="about" element={<NotFoundPage />} />
          <Route path="setup" element={<NotFoundPage />} />
          <Route path="tutorial" element={<NotFoundPage />} />
          <Route path="demo" element={<NotFoundPage />} />
          <Route path="sandbox" element={<NotFoundPage />} />
          <Route path="examples" element={<NotFoundPage />} />
          <Route path="resources" element={<NotFoundPage />} />
          <Route path="api" element={<NotFoundPage />} />
          <Route path="docs" element={<NotFoundPage />} />
          <Route path="configuration" element={<NotFoundPage />} />
          <Route path="contributing" element={<NotFoundPage />} />
          <Route path="community" element={<NotFoundPage />} />
          <Route path="faq" element={<NotFoundPage />} />
          <Route path="changelog" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="completion" element={<CompletionPage />} />
      </Routes>
    </BrowserRouter>
  )
}