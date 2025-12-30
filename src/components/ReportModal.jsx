import React , {useState} from 'react'
import api from "../api"
import toast from 'react-hot-toast'
import "../styles/ReportModal.css"
import { IoClose } from "react-icons/io5";

function ReportModal({ isOpen, onClose, targetId, targetType, targetPost }) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if(!isOpen) return null;

    const handleSubmit = async (e)=>{
        e.preventDefault();
        if(!reason) return toast.error("Please select a reason");

        setIsLoading(true);

        try{
            await api.post("/report",{
                target : targetId,
                targetType,
                targetPost,
                reason,
                description
            });
            toast.success("Report submitted. Thank You!");
            onClose();
            setReason(""); setDescription("");
        }catch(error)
        {
            toast.error(error.response?.data?.message || "Failed to report");
        }finally{
            setIsLoading(false);
        }
    }

    return (
        <div className='report-overlay'>
            <div className='report-modal'>
                <div className='report-header'>
                    <h3>Report {targetType}</h3>
                    <button onClick={()=>{
                        setDescription("");setReason("");onClose();
                    }}><IoClose/></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label>Report Reason ?</label>
                    <select className='report-select' required value={reason} onChange={(e)=>{setReason(e.target.value)}}>
                        <option value="" disabled>Select a reason</option>
                        <option value="Hate Speech">Hate Speech (race, religion, gender)</option>
                        <option value="Profanity">Profanity or Insults</option>
                        <option value="Harrasment">Harrasment or Abusive Behavior</option>
                        <option value="Violence">Violence or Threats</option>
                        <option value="Spam">Spam</option>
                        <option value="False Information">False Information</option>
                        <option value="Copyright Infringement">Copyright Infringement</option>
                        <option value="Adult or Inappropriate Content">Adult or Inappropriate Content</option>
                        <option value="Other">Other</option>
                    </select>

                    <label>Description (Optional)</label>
                    <textarea className='report-textarea' value={description} onChange={(e)=>{setDescription(e.target.value)}} placeholder='Provide more details...' rows={3} maxLength={300}></textarea>

                    <button type='submit' className='report-submit-btn' disabled={isLoading}>{isLoading?"Submitting": "Submit Report"}</button>
                </form>
            </div>
        </div>
    )
}

export default ReportModal
