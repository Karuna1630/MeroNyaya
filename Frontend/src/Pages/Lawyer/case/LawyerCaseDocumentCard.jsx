import React, { useRef, useState } from "react";
import { FileText, Upload, Download } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { uploadCaseDocuments, fetchCases } from "../../slices/caseSlice";
import Pagination from "../../../components/Pagination";

const LawyerCaseDocumentCard = ({ caseId, documents = [], isAssignedLawyer = true }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { uploadDocumentsLoading } = useSelector((state) => state.case);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // function to handle file input changes 
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        // Dispatch the uploadCaseDocuments action with the selected files and case ID, then refresh the cases to reflect the new documents in real-time
        await dispatch(uploadCaseDocuments({ caseId, files })).unwrap();
        // Refresh cases to get updated documents in real-time
        await dispatch(fetchCases()).unwrap();
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Failed to upload documents:', error);
        alert('Failed to upload documents. Please try again.');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Case Documents</h3>
        {isAssignedLawyer && (
          <>
            <button 
              onClick={handleUploadClick}
              disabled={uploadDocumentsLoading}
              className="px-4 py-2 bg-[#0F1A3D] text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} />
              {uploadDocumentsLoading ? 'Uploading...' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedDocuments.map((doc) => {
            const isClientUpload = doc.uploaded_by_role === 'Client';
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{doc.file_name}</h4>
                    <p className="text-xs text-gray-600">
                      {formatFileSize(doc.file_size)} • Uploaded on {formatDate(doc.uploaded_at)}
                    </p>
                    <div className="mt-0.5">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        isClientUpload 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {doc.uploaded_by_name ? `${doc.uploaded_by_name} (${doc.uploaded_by_role || 'User'})` : 'Unknown Uploader'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(doc.file, doc.file_name)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Download size={18} className="text-gray-600" />
                </button>
              </div>
            );
          })}
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={documents.length}
          />
        </>
      )}
    </div>
  );
};

export default LawyerCaseDocumentCard;
