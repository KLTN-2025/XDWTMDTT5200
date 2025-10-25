import { useState } from "react"
import { useEffect } from "react"

import { Card, Row, Col, Typography } from "antd"
import "./article.scss"
import { listArticles } from "../../../services/client/articlesServies"

const { Title, Paragraph, Text } = Typography


export default function Article() {

  const [articles, setArticles] = useState([]);

  useEffect(() => {

    const fetchApi = async () => {
      const responseArticles = await listArticles();
      if (responseArticles.code === 200) {
        setArticles(responseArticles.data);
      }
    }

    fetchApi();

  }, []);

  return (
    <div className="blog-slide-container" >
      <div className="blog-header">
        <Title level={2} className="blog-title">
          FROM OUR BLOG
        </Title>
        <Paragraph className="blog-subtitle">
          Commodo sociosqu venenatis cras dolor sagittis integer luctus sem primis eget
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} className="blog-grid">
        {articles.length > 0 && (
          <>
            {articles.map((art) => (
              <Col xs={24} sm={12} lg={8} key={art._id}>
                <Card
                  hoverable
                  className="blog-card"
                  cover={
                    <div className="blog-card-image">
                      <img
                        alt={art.title}
                        src={art.thumbnail || "/placeholder.svg"}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                    </div>
                  }
                >
                  <div className="blog-card-content">
                    <Text className="blog-author">Posted by {art.author}</Text>
                    <a href={`/articles/${art.slug}`} target="_blank" rel="noopener noreferrer">
                      <Title level={4} className="blog-card-title">
                        {art.title}
                      </Title>
                    </a>
                    <Paragraph className="blog-card-description">{art.excerpt}</Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </>
        )}
      </Row>
    </div>
  )
}