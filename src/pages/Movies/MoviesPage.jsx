import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import 'react-multi-carousel/lib/styles.css';
import ReactPaginate from 'react-paginate';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MovieCard from '../../common/MovieCard/MovieCard';
import { useSearchMovieQuery } from '../../hooks/useSearchMovie';
import './MoviePage.style.css';

const MoviesPage = () => {
  const [query, setQuery] = useSearchParams();
  const [page, setPage] = useState(1);
  const categoryFromQuery = query.get("category") || 'popular';
  const genreFromQuery = query.get("genre") || ''; // 장르 상태 추가
  const [category, setCategory] = useState(categoryFromQuery);
  const [genre, setGenre] = useState(genreFromQuery); // 장르 상태
  const keyword = query.get("q") || ''; 
  const navigate = useNavigate();

  const genreIds = {
    action: 28,
    comedy: 35,
    drama: 18
  };
  
  const { data, isLoading, isError, error } = useSearchMovieQuery({keyword, page, category, genre});

  useEffect(() => {
    setPage(1);// 페이지가 변경될 때마다 페이지를 1로 초기화
  }, [keyword, category, genre]); // keyword와 category가 변경될 때

  useEffect(() => { // 페이지, 카테고리, 장르가 변경될 때마다 URL 쿼리 파라미터를 업데이트합니다.
    setQuery({ q: keyword, category, genre });
  }, [page, category, genre, keyword]);

  const handlePageClick=({selected})=> {
    setPage(selected + 1);
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // 현재 쿼리 파라미터를 기반으로 새로운 URLSearchParams 객체를 생성합니다.
    const newQuery = new URLSearchParams(query.toString());
    
    if (name === 'category') {
      newQuery.set('category', value);
      setCategory(value); // 카테고리 상태 업데이트
    } else if (name === 'genre') {
      newQuery.set('genre', value);
      setGenre(value); // 장르 상태 업데이트
    }

    newQuery.delete('q'); // 'q' 파라미터가 존재하면 삭제합니다.
    
    setQuery(newQuery.toString()); // 업데이트된 쿼리 문자열로 URL을 설정합니다.
    setPage(1); // 페이지 번호를 1로 초기화합니다.
  };

  const handleMovieClick = (id, e) => {
    e.preventDefault();
    navigate(`/movies/${id}`);
  };

  // 장르 필터링
  const filteredMovies = data?.results.filter(movie => {
    if (!genre) return true; // 장르 필터가 설정되지 않은 경우 모든 영화 표시
    return movie.genre_ids.includes(parseInt(genreIds[genre]));
  });

  if(isLoading) {
    return(
      <div className='spinner-area'>
        <Spinner
          animation="border"
          variant="danger"
          style={{ width: "5rem", height: "5rem" }}
        />
      </div>
    )
  }

  if (isError) {
    return <Alert variant="danger">{error.message}</Alert>;
}

  return (
    <div className="container-wrap MoviesPage-wrap">
      <Container>
        <Row>
          <Col lg={4} xs={12}>
            <Form>
              <h5 className="filter-tit">Filters</h5>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
                  name="category"
                  value={category}
                  onChange={handleFilterChange}
                >
                  <option value="popular">Popular</option>
                  <option value="nowplaying">Now Playing</option>
                  <option value="toprated">Top Rated</option>
                  <option value="upcoming">Upcoming</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Genre</Form.Label>
                <Form.Control
                  as="select"
                  name="genre"
                  value={genre}
                  onChange={handleFilterChange}
                >
                  <option value="">All Genres</option>
                  <option value="action">Action</option>
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                </Form.Control>
              </Form.Group>
              {/* <Button variant="primary" type="submit">Apply Filters</Button> */}
            </Form>
          </Col>

          <Col lg={8} xs={12}>
            <Row>
              {filteredMovies?.length === 0 ? (
                <Col xs={12}>
                  <Alert variant="warning">No movies found!</Alert>
                </Col>
              ) : (
                filteredMovies.map((movie, index) => (
                  <Col
                    key={index}
                    lg={4}
                    xs={12}
                  >
                    <div onClick={(e) => handleMovieClick(movie.id, e)}>
                      <MovieCard movie={movie} />
                    </div>
                  </Col>
                ))
              )}
            </Row>
            {data?.results.length > 0 && (
              <ReactPaginate
                nextLabel="➡️"
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                pageCount={data?.total_pages}
                previousLabel="⬅️"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeClassName="active"
                renderOnZeroPageCount={null}
                forcePage={page - 1}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default MoviesPage
