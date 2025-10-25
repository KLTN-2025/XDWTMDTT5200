
import { useState, useRef, useEffect } from "react"
import { Button, Input, Badge, Avatar, Typography, Spin, Card, Tag } from "antd"
import {
  MessageOutlined,
  SendOutlined,
  MinusOutlined,
  CloseOutlined,
  UserOutlined,
  RobotOutlined,
  ShoppingOutlined,
  EyeOutlined,
  PercentageOutlined,
} from "@ant-design/icons"
import { chatBot } from "../../services/client/chatBotServies"

const { Text, Title } = Typography
const LOCAL_STORAGE_KEY = "chatbot_messages"

const ChatBotAi = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load messages from localStorage
  useEffect(() => {
    const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    } else {
      setMessages([
        {
          id: 1,
          text: "Xin chào! Tôi có thể giúp gì cho bạn? 👋",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages))
    }
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      inputRef.current?.focus()
      scrollToBottom()
    }
  }, [isOpen])

  // Parse product data from markdown text
  const parseProductData = (text) => {
    const products = []
    const productRegex =
      /\d+\.\s\*\*(.*?)\*\*\s*\n\s*-\s\*\*Giá:\*\*\s([\d,.]+)\sVNĐ\s*\n\s*-\s\*\*Giảm giá:\*\*\s(\d+)%\s*\n\s*-\s\*\*Size còn hàng:\*\*\s(.*?)\n\s*-\s!\[.*?\]$$(.*?)$$\s*\n\s*-\s\[Xem chi tiết\]$$(.*?)$$/g

    let match
    while ((match = productRegex.exec(text)) !== null) {
      const [, name, price, discount, sizes, image, link] = match
      products.push({
        name: name.trim(),
        price: price.replace(/,/g, ""),
        discount: Number.parseInt(discount),
        sizes: sizes.trim(),
        image: image.trim(),
        link: link.trim(),
      })
    }

    return products
  }

  // Format message content
  const formatMessageContent = (text) => {
    const products = parseProductData(text)

    if (products.length > 0) {
      return (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-3">Dưới đây là một số sản phẩm nổi bật:</div>
          {products.map((product, index) => (
            <Card
              key={index}
              className="product-card hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50"
              bodyStyle={{ padding: "12px" }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = "/diverse-products-still-life.png"
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Title level={5} className="!mb-1 !text-sm font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </Title>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-red-600">
                      {Number.parseInt(product.price).toLocaleString("vi-VN")}đ
                    </span>
                    {product.discount > 0 && (
                      <Tag color="red" className="text-xs px-1 py-0">
                        <PercentageOutlined className="text-xs mr-1" />-{product.discount}%
                      </Tag>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    <ShoppingOutlined className="mr-1" />
                    Size: {product.sizes}
                  </div>

                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    className="bg-blue-500 hover:bg-blue-600 border-0 text-xs h-7"
                    onClick={() => window.open(product.link, "_blank")}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    // Regular text formatting
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>")
      .replace(/!\[.*?\]$$(.*?)$$/g, '<img src="$1" alt="image" class="max-w-full h-auto rounded-lg my-2" />')
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" target="_blank" class="text-blue-500 hover:text-blue-700 underline">$1</a>',
      )

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />
  }

  const addResponseMessage = (reply) => {
    const botResponse = {
      id: Date.now() + 1,
      text: reply,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botResponse])
    setIsLoading(false)

    if (!isOpen) {
      setUnreadCount((prev) => prev + 1)
    }
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    const messageToSend = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      const res = await chatBot({ message: messageToSend })
      addResponseMessage(res.reply)
    } catch (error) {
      console.error("Error calling chatBot API:", error)
      addResponseMessage("Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Badge count={unreadCount} offset={[-8, 8]}>
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-lg"
            />
          </Badge>
        </div>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-50 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 cursor-pointer select-none"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageOutlined className="text-lg" />
                <div>
                  <Text className="text-white font-semibold text-base">Hỗ trợ AI</Text>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <Text className="text-blue-100 text-xs">Đang hoạt động</Text>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="text"
                  icon={<MinusOutlined />}
                  size="small"
                  className="text-white hover:bg-white/20 border-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMinimized(!isMinimized)
                  }}
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  size="small"
                  className="text-white hover:bg-white/20 border-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                    setIsMinimized(false)
                  }}
                />
              </div>
            </div>
          </div>

          {/* Messages Container */}
          {!isMinimized && (
            <>
              <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${
                        message.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar
                        size="small"
                        icon={message.sender === "user" ? <UserOutlined /> : <RobotOutlined />}
                        className={`flex-shrink-0 ${
                          message.sender === "user" ? "bg-blue-500" : "bg-gradient-to-r from-gray-400 to-gray-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`p-3 rounded-2xl ${
                            message.sender === "user"
                              ? "bg-blue-500 text-white rounded-tr-md"
                              : "bg-white border border-gray-200 text-gray-800 rounded-tl-md shadow-sm"
                          }`}
                        >
                          {message.sender === "bot" ? (
                            formatMessageContent(message.text)
                          ) : (
                            <div className="break-words">{message.text}</div>
                          )}
                        </div>
                        <Text className="text-xs text-gray-400 mt-1 block">{formatTime(message.timestamp)}</Text>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <Avatar
                        size="small"
                        icon={<RobotOutlined />}
                        className="bg-gradient-to-r from-gray-400 to-gray-500"
                      />
                      <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-md shadow-sm">
                        <div className="flex items-center gap-2">
                          <Spin size="small" />
                          <Text className="text-sm text-gray-600">Đang trả lời...</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Container */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 rounded-full border-gray-300 focus:border-blue-500 px-4"
                    maxLength={500}
                    disabled={isLoading}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={inputValue.trim() === "" || isLoading}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 border-0 w-10 h-10 flex items-center justify-center"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .product-card {
          transition: all 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-2px);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}

export default ChatBotAi
