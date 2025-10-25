// import { useState } from "react";
// import { Upload, Input } from "antd";
// import { PlusOutlined } from "@ant-design/icons";

// function UploadFile(props) {

//   // Lưu danh sách file hiển thị trên Upload
//   const [fileList, setFileList] = useState([]);

//   // Lưu mảng URL ảnh đã upload thành công
//   const [imageUrls, setImageUrls] = useState(props.initialImageUrls || "");

//   // Hàm upload 1 file lên Cloudinary
//   const handleUpload = async (options) => {

//     const { file, onSuccess, onError } = options;

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", "my_preset"); // Thay bằng preset của bạn

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/djckm3ust/image/upload`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );
//       const data = await response.json();

//       if (data.secure_url) {
//         setImageUrls(data.secure_url); // Lưu đường dẫn ảnh
//         props.onImageUrlsChange?.(data.secure_url); // Cập nhật lên cha

//         setFileList([
//           {
//             uid: data.asset_id,
//             name: data.original_filename,
//             status: "done",
//             url: data.secure_url,
//           },
//         ]);
//         onSuccess(data);
//       }
//     } catch (error) {
//       console.error("Lỗi khi upload ảnh:", error);
//       onError(error);
//     }
//   };


//   // Xử lý xóa một file khỏi list
//   const handleRemove = () => {
//     setImageUrls(""); // Xóa link ảnh
//     setFileList([]); // Xóa danh sách file
//     props.onImageUrlsChange?.("");
//   };


//   return (
//     <div>
//       <Upload
//         name="file"
//         listType="picture-card"
//         showUploadList={{ showPreviewIcon: false }}
//         maxCount={1} // Giới hạn chỉ được chọn 1 ảnh
//         customRequest={handleUpload}
//         onChange={({ fileList: newFileList }) => setFileList(newFileList)}
//         onRemove={handleRemove}
//         defaultFileList={[
//           ...(fileList.length
//             ? fileList
//             : [
//               {
//                 uid: "-1", // UID duy nhất cho ảnh đã có
//                 name: "existing-image", // Tên ảnh có sẵn
//                 status: "done",
//                 url: imageUrls, // Hiển thị ảnh hiện tại trong preview
//               },
//             ]),
//         ]}
//       >
//         {fileList.length >= 1 ? null : (
//           <div>
//             <PlusOutlined />
//             <div style={{ marginTop: 8 }}>Upload</div>
//           </div>
//         )}
//       </Upload>
//       {imageUrls && (
//         <div style={{ marginTop: "10px" }}>
//           <p>Link ảnh:</p>
//           <Input value={imageUrls} readOnly />
//         </div>
//       )}
//     </div>
//   );
// }

// export default UploadFile;

import { useState, useEffect } from "react";
import { Upload, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";

function UploadFile(props) {
  const [fileList, setFileList] = useState([]);
  const [imageUrls, setImageUrls] = useState("");

  // Khi initialImageUrls thay đổi thì sync vào fileList
  useEffect(() => {
    if (props.initialImageUrls) {
      setImageUrls(props.initialImageUrls);
      setFileList([
        {
          uid: "-1",
          name: "existing-image",
          status: "done",
          url: props.initialImageUrls,
        },
      ]);
    }
  }, [props.initialImageUrls]);

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_preset");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/djckm3ust/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();

      if (data.secure_url) {
        setImageUrls(data.secure_url);
        props.onImageUrlsChange?.(data.secure_url);

        const newFileList = [
          {
            uid: data.asset_id || Date.now().toString(),
            name: data.original_filename,
            status: "done",
            url: data.secure_url,
          },
        ];
        setFileList(newFileList);
        onSuccess(data);
      }
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      onError(error);
    }
  };

  const handleRemove = () => {
    setImageUrls("");
    setFileList([]);
    props.onImageUrlsChange?.("");
  };

  return (
    <div>
      <Upload
        name="file"
        listType="picture-card"
        showUploadList={{ showPreviewIcon: false }}
        maxCount={1}
        customRequest={handleUpload}
        fileList={fileList} // ✅ dùng fileList thay vì defaultFileList
        onRemove={handleRemove}
      >
        {fileList.length >= 1 ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
      {imageUrls && (
        <div style={{ marginTop: "10px" }}>
          <p>Link ảnh:</p>
          <Input value={imageUrls} readOnly />
        </div>
      )}
    </div>
  );
}

export default UploadFile;

