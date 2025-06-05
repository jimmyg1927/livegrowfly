// File: components/FileActions/SmartPrompts.tsx

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaLightbulb, FaChartLine, FaFileImage, FaFilePdf, FaFileAlt, FaFileExcel } from 'react-icons/fa'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
}

interface SmartPromptsProps {
  files: UploadedFile[]
  onPromptSelect: (prompt: string) => void
  className?: string
}

const SmartPrompts: React.FC<SmartPromptsProps> = ({ files, onPromptSelect, className = '' }) => {
  const getSmartPrompts = (files: UploadedFile[]) => {
    if (files.length === 0) return []

    const fileTypes = files.map(f => f.type)
    const fileNames = files.map(f => f.name.toLowerCase())
    const hasImages = fileTypes.some(type => type.startsWith('image/'))
    const hasPDFs = fileTypes.some(type => type === 'application/pdf')
    const hasDocuments = fileTypes.some(type => type.includes('word') || type.includes('document'))
    const hasSpreadsheets = fileTypes.some(type => type.includes('spreadsheet') || type.includes('excel')) // ✅ Now we'll use this

    const prompts: Array<{ icon: React.ReactNode; text: string; category: string }> = []

    // Image-specific prompts
    if (hasImages) {
      prompts.push(
        { icon: <FaFileImage className="text-blue-500" />, text: "Analyze this image for business opportunities and marketing insights", category: "Visual Analysis" },
        { icon: <FaChartLine className="text-green-500" />, text: "What trends or patterns do you see in this image that could help my business?", category: "Business Intelligence" },
        { icon: <FaLightbulb className="text-yellow-500" />, text: "How can I use this visual content to improve my brand and marketing strategy?", category: "Strategy" }
      )
    }

    // PDF-specific prompts
    if (hasPDFs) {
      prompts.push(
        { icon: <FaFilePdf className="text-red-500" />, text: "Summarize the key points and action items from this document", category: "Document Analysis" },
        { icon: <FaChartLine className="text-green-500" />, text: "Extract business insights and recommendations from this PDF", category: "Business Intelligence" },
        { icon: <FaLightbulb className="text-yellow-500" />, text: "What are the main risks and opportunities mentioned in this document?", category: "Risk Assessment" }
      )
    }

    // Document-specific prompts
    if (hasDocuments) {
      prompts.push(
        { icon: <FaFileAlt className="text-purple-500" />, text: "Convert this document into actionable business tasks and timelines", category: "Project Management" },
        { icon: <FaChartLine className="text-green-500" />, text: "Analyze this document for compliance and process improvement opportunities", category: "Operations" }
      )
    }

    // ✅ FIXED: Added spreadsheet-specific prompts to use the hasSpreadsheets variable
    if (hasSpreadsheets) {
      prompts.push(
        { icon: <FaFileExcel className="text-green-600" />, text: "Analyze this spreadsheet data for trends, patterns, and business insights", category: "Data Analysis" },
        { icon: <FaChartLine className="text-green-500" />, text: "What key metrics and KPIs can we extract from this spreadsheet data?", category: "Financial Analysis" },
        { icon: <FaLightbulb className="text-yellow-500" />, text: "How can we optimize operations based on this spreadsheet data?", category: "Operations Strategy" }
      )
    }

    // File name-based prompts
    const financialKeywords = ['budget', 'finance', 'cost', 'revenue', 'profit', 'expense']
    const marketingKeywords = ['marketing', 'campaign', 'social', 'brand', 'content']
    const reportKeywords = ['report', 'analysis', 'summary', 'review', 'quarterly']
    const strategyKeywords = ['strategy', 'plan', 'roadmap', 'goals', 'vision']

    if (fileNames.some(name => financialKeywords.some(keyword => name.includes(keyword)))) {
      prompts.push(
        { icon: <FaChartLine className="text-green-500" />, text: "Analyze this financial data for cost-saving opportunities and ROI improvements", category: "Financial Analysis" },
        { icon: <FaLightbulb className="text-yellow-500" />, text: "What budget optimizations and revenue growth strategies do you recommend?", category: "Financial Strategy" }
      )
    }

    if (fileNames.some(name => marketingKeywords.some(keyword => name.includes(keyword)))) {
      prompts.push(
        { icon: <FaChartLine className="text-green-500" />, text: "Evaluate this marketing content and suggest improvements for better engagement", category: "Marketing Analysis" },
        { icon: <FaLightbulb className="text-yellow-500" />, text: "How can I optimize this marketing strategy for my target audience?", category: "Marketing Strategy" }
      )
    }

    if (fileNames.some(name => reportKeywords.some(keyword => name.includes(keyword)))) {
      prompts.push(
        { icon: <FaFileAlt className="text-purple-500" />, text: "Extract the key findings and create an executive summary from this report", category: "Executive Summary" },
        { icon: <FaChartLine className="text-green-500" />, text: "What are the most important metrics and trends in this report?", category: "Data Analysis" }
      )
    }

    if (fileNames.some(name => strategyKeywords.some(keyword => name.includes(keyword)))) {
      prompts.push(
        { icon: <FaLightbulb className="text-yellow-500" />, text: "Review this strategy and suggest improvements for better execution", category: "Strategic Planning" },
        { icon: <FaChartLine className="text-green-500" />, text: "How can I measure the success of this strategy and track progress?", category: "KPI Development" }
      )
    }

    // Generic prompts if no specific patterns found
    if (prompts.length === 0) {
      prompts.push(
        { icon: <FaLightbulb className="text-yellow-500" />, text: "What business insights can you extract from these files?", category: "General Analysis" },
        { icon: <FaChartLine className="text-green-500" />, text: "How can this information help improve my business operations?", category: "Business Improvement" },
        { icon: <FaFileAlt className="text-purple-500" />, text: "Summarize the key information and provide actionable recommendations", category: "Summary & Action" }
      )
    }

    // Remove duplicates and limit to 6 prompts
    const uniquePrompts = prompts.filter((prompt, index, self) => 
      index === self.findIndex(p => p.text === prompt.text)
    ).slice(0, 6)

    return uniquePrompts
  }

  const smartPrompts = getSmartPrompts(files)

  if (smartPrompts.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-xl p-4 border border-blue-200 dark:border-slate-600 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <FaLightbulb className="text-yellow-500" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          Smart Prompts for Your Files
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {smartPrompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onPromptSelect(prompt.text)}
            className="group flex items-start gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
          >
            <div className="flex-shrink-0 mt-0.5">
              {prompt.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                {prompt.category}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {prompt.text}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 These prompts are tailored to your uploaded files
      </div>
    </motion.div>
  )
}

export default SmartPrompts