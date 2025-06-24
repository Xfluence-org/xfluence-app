
import React, { useState } from 'react';
import { X, Upload, Trash2, Download, Send, Check, Clock } from 'lucide-react';
import { TaskDetail } from '@/types/taskDetail';
import { Textarea } from '@/components/ui/textarea';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskDetail: TaskDetail | null;
  onSubmitForReview: (taskId: string) => void;
  onDownloadBrief: (taskId: string) => void;
  onSendMessage: (taskId: string, message: string) => void;
  onFileUpload: (taskId: string, files: FileList) => void;
  onDeleteFile: (taskId: string, fileId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  taskDetail,
  onSubmitForReview,
  onDownloadBrief,
  onSendMessage,
  onFileUpload,
  onDeleteFile
}) => {
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || !taskDetail) return null;

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(taskDetail.id, message);
      setMessage('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(taskDetail.id, files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(taskDetail.id, files);
    }
  };

  const getStatusIcon = (completed: boolean, isCurrent: boolean) => {
    if (completed) {
      return <Check className="w-4 h-4 text-[#1DDCD3]" />;
    } else if (isCurrent) {
      return <Clock className="w-4 h-4 text-[#1DDCD3]" />;
    }
    return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1f2e] mb-2">
              {taskDetail.title} - {taskDetail.platform}
            </h1>
            <p className="text-gray-600 text-lg">
              {taskDetail.brand} • Due: {taskDetail.dueDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white rounded-xl transition-all duration-200 shadow-sm border border-gray-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Task Status */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1a1f2e] mb-6">Task Status</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(taskDetail.status.contentRequirement, taskDetail.status.currentStep === 'contentRequirement')}
                  <span className={`${taskDetail.status.contentRequirement ? 'text-[#1DDCD3]' : 'text-gray-600'} font-medium`}>
                    Content Requirement
                  </span>
                  {taskDetail.status.currentStep === 'contentRequirement' && (
                    <span className="text-xs bg-[#1DDCD3]/10 text-[#1DDCD3] px-3 py-1 rounded-full font-medium">current</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {getStatusIcon(taskDetail.status.contentReview, taskDetail.status.currentStep === 'contentReview')}
                  <span className={`${taskDetail.status.contentReview ? 'text-[#1DDCD3]' : 'text-gray-600'} font-medium`}>
                    Content Review
                  </span>
                  {taskDetail.status.currentStep === 'contentReview' && (
                    <span className="text-xs bg-[#1DDCD3]/10 text-[#1DDCD3] px-3 py-1 rounded-full font-medium">current</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {getStatusIcon(taskDetail.status.publishContent, taskDetail.status.currentStep === 'publishContent')}
                  <span className={`${taskDetail.status.publishContent ? 'text-[#1DDCD3]' : 'text-gray-600'} font-medium`}>
                    Publish Content
                  </span>
                  {taskDetail.status.currentStep === 'publishContent' && (
                    <span className="text-xs bg-[#1DDCD3]/10 text-[#1DDCD3] px-3 py-1 rounded-full font-medium">current</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {getStatusIcon(taskDetail.status.contentAnalytics, taskDetail.status.currentStep === 'contentAnalytics')}
                  <span className={`${taskDetail.status.contentAnalytics ? 'text-[#1DDCD3]' : 'text-gray-600'} font-medium`}>
                    Content Analytics
                  </span>
                  {taskDetail.status.currentStep === 'contentAnalytics' && (
                    <span className="text-xs bg-[#1DDCD3]/10 text-[#1DDCD3] px-3 py-1 rounded-full font-medium">current</span>
                  )}
                </div>
              </div>
            </section>

            {/* Task Details */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1a1f2e] mb-6">Task Details</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[#1a1f2e] mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {taskDetail.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-[#1a1f2e] mb-3">Deliverables</h3>
                  <ul className="space-y-2">
                    {taskDetail.deliverables.map((deliverable, index) => (
                      <li key={index} className="text-gray-600 flex items-center gap-3">
                        <span className="w-2 h-2 bg-[#1DDCD3] rounded-full"></span>
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* AI Score */}
            <section className="bg-gradient-to-r from-[#1DDCD3]/10 to-[#1DDCD3]/5 border border-[#1DDCD3]/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a1f2e]">AI Score</h2>
                <span className="text-3xl font-bold text-[#1DDCD3]">{taskDetail.aiScore}/100</span>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Feedbacks */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1a1f2e] mb-6">Feedbacks</h2>
              
              <div className="space-y-6">
                {taskDetail.feedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#1a1f2e]">{feedback.from}</span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(feedback.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-600">{feedback.message}</p>
                  </div>
                ))}
                
                {/* Message Input */}
                <div className="space-y-4">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Send a message to the brand..."
                    className="resize-none focus:ring-[#1DDCD3] focus:border-[#1DDCD3]"
                    rows={3}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="w-full bg-[#1DDCD3] text-white py-3 px-4 rounded-lg hover:bg-[#1DDCD3]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </section>

            {/* Content Uploads */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1a1f2e] mb-6">Content Uploads</h2>
              
              <div className="space-y-6">
                {/* Uploaded Files */}
                {taskDetail.uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-[#1a1f2e] font-medium">{upload.filename}</span>
                    <button
                      onClick={() => onDeleteFile(taskDetail.id, upload.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    isDragging 
                      ? 'border-[#1DDCD3] bg-[#1DDCD3]/5' 
                      : 'border-gray-300 hover:border-[#1DDCD3]/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4 font-medium">Upload your Content files</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,video/*"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-[#1DDCD3] text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-[#1DDCD3]/90 transition-all duration-200 inline-block font-medium shadow-lg"
                  >
                    Choose Files: No file chosen
                  </label>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <section className="space-y-4">
              <button
                onClick={() => onSubmitForReview(taskDetail.id)}
                className="w-full bg-[#1DDCD3] text-white py-4 px-4 rounded-lg hover:bg-[#1DDCD3]/90 transition-all duration-200 font-semibold text-lg shadow-lg"
              >
                Submit for review
              </button>
              <button
                onClick={() => onDownloadBrief(taskDetail.id)}
                className="w-full border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-lg hover:bg-gray-50 hover:border-[#1DDCD3] transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download brief
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
