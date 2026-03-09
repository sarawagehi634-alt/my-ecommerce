// ContactMessages.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, FaEye, FaTrashAlt, FaUser, FaPhone, FaCalendarAlt,
  FaEnvelopeOpen, FaEnvelope as FaEnvelopeClosed, FaSync, FaReply, FaTimes
} from 'react-icons/fa';
import { MdSubject, MdMessage } from 'react-icons/md';
import contactService from '../../services/contactService';
import toast from 'react-hot-toast';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // جلب الرسائل
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await contactService.getMessages();
      if (response?.data) setMessages(response.data);
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
      toast.error('حدث خطأ في تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  // فلترة الرسائل حسب البحث
  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // عرض تفاصيل الرسالة
  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
    
    if (message.status === 'unread') {
      await contactService.updateMessageStatus(message.id, 'read');
      fetchMessages();
    }
  };

  // حذف رسالة
  const handleDeleteMessage = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      const result = await contactService.deleteMessage(id);
      if (result.status) {
        toast.success('تم حذف الرسالة بنجاح');
        fetchMessages();
        setShowViewModal(false);
      }
    }
  };

  // الرد على الرسالة
  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error('الرجاء كتابة الرد');
      return;
    }
    window.location.href = `mailto:${selectedMessage.email}?subject=رد: ${selectedMessage.subject}&body=${encodeURIComponent(replyText)}`;
    setShowReplyModal(false);
    toast.success('تم فتح البريد الإلكتروني');
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
      {/* رأس الصفحة */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FaEnvelope className="text-primary-600" /> رسائل الاتصال
          </h1>
          <p className="text-gray-600 flex items-center gap-2 text-sm">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            وضع التطوير - تخزين محلي
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث عن الرسائل..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
          />
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition-all"
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
        </div>
      </div>

      {/* جدول الرسائل */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-l from-gray-50 to-gray-100">
              <tr>
                <th className="text-right py-4 px-6">الحالة</th>
                <th className="text-right py-4 px-6">المرسل</th>
                <th className="text-right py-4 px-6">البريد</th>
                <th className="text-right py-4 px-6">الموضوع</th>
                <th className="text-right py-4 px-6">التاريخ</th>
                <th className="text-right py-4 px-6">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      <span>جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <FaEnvelope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد رسائل</p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      {message.status === 'unread' ? (
                        <FaEnvelopeClosed className="w-5 h-5 text-primary-600" title="غير مقروء" />
                      ) : (
                        <FaEnvelopeOpen className="w-5 h-5 text-gray-400" title="مقروء" />
                      )}
                    </td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <FaUser className="text-gray-400" /> {message.name}
                    </td>
                    <td className="py-4 px-6" dir="ltr">{message.email}</td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <MdSubject className="text-gray-400" /> {message.subject}
                    </td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="text-sm">{formatDate(message.created_at)}</span>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg"
                        title="عرض"
                      ><FaEye /></button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
                        title="حذف"
                      ><FaTrashAlt /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* إحصائيات */}
        {messages.length > 0 && (
          <div className="p-4 border-t bg-gray-50 flex gap-4 text-sm">
            <span>إجمالي الرسائل: <strong>{messages.length}</strong></span>
            <span>غير مقروء: <strong className="text-primary-600">{messages.filter(m => m.status === 'unread').length}</strong></span>
            <span>مقروء: <strong className="text-green-600">{messages.filter(m => m.status === 'read').length}</strong></span>
          </div>
        )}
      </div>

      {/* مودال العرض والرد */}
      {showViewModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-l from-primary-600 to-skin-600 px-6 py-4 text-white flex justify-between">
              <h2 className="text-xl font-bold">تفاصيل الرسالة</h2>
              <button onClick={() => setShowViewModal(false)} className="hover:text-gray-200"><FaTimes /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">الاسم</p>
                  <p className="font-semibold flex items-center gap-2"><FaUser className="text-primary-600" /> {selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="font-semibold flex items-center gap-2" dir="ltr"><FaEnvelope className="text-primary-600" /> {selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                    <p className="font-semibold flex items-center gap-2" dir="ltr"><FaPhone className="text-primary-600" /> {selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">التاريخ</p>
                  <p className="font-semibold flex items-center gap-2"><FaCalendarAlt className="text-primary-600" /> {formatDate(selectedMessage.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">الموضوع</p>
                <p className="font-semibold p-3 bg-gray-50 rounded-lg flex items-center gap-2"><MdSubject className="text-primary-600" /> {selectedMessage.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">الرسالة</p>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line"><MdMessage className="w-5 h-5 text-primary-600 mb-2" /> {selectedMessage.message}</div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                ><FaReply /> رد</button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowReplyModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="sticky top-0 bg-gradient-to-l from-primary-600 to-skin-600 px-6 py-4 text-white flex justify-between">
              <h2 className="text-xl font-bold">رد على الرسالة</h2>
              <button onClick={() => setShowReplyModal(false)} className="hover:text-gray-200"><FaTimes /></button>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-700">الرد على: <span className="font-semibold">{selectedMessage.email}</span></p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 resize-none mb-4"
                placeholder="اكتب ردك هنا..."
              />
              <div className="flex gap-3">
                <button onClick={handleSendReply} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">إرسال الرد</button>
                <button onClick={() => setShowReplyModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;