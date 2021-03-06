import React, { useEffect, useState, useRef } from "react";

import { DataGrid, GridToolbar, GridOverlay } from "@material-ui/data-grid";
import { useSelector, useDispatch } from "react-redux";
import Button from "@material-ui/core/Button";
import { useSnackbar } from "notistack";
import CircularProgress from "@material-ui/core/CircularProgress";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Dialog from "@material-ui/core/Dialog";
import AddBoxIcon from "@material-ui/icons/AddBox";
import RenderCellExpand from "./RenderCellExpand";
import slugify from "slugify";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import { useStyles, DialogContent, DialogTitle } from "./styles";
import {
  getMovieListManagement,
  deleteMovie,
  updateMovieUpload,
  resetMoviesManagement,
  updateMovie,
  addMovieUpload,
} from "../../reducers/actions/Movie";
import Action from "./Action";
import ThumbnailYoutube from "./ThumbnailYoutube";
import Form from "./Form";

function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <CircularProgress style={{ margin: "auto" }} />
    </GridOverlay>
  );
}

export default function MoviesManagement() {
  const [movieListDisplay, setMovieListDisplay] = useState([]);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  let {
    movieList2,
    loadingMovieList2,
    loadingDeleteMovie,
    errorDeleteMovie,
    successDeleteMovie,
    successUpdateMovie,
    errorUpdateMovie,
    loadingUpdateMovie,
    loadingAddUploadMovie,
    successAddUploadMovie,
    errorAddUploadMovie,
    loadingUpdateNoneImageMovie,
    successUpdateNoneImageMovie,
    errorUpdateNoneImageMovie,
  } = useSelector((state) => state.movieReducer);
  const dispatch = useDispatch();
  const newImageUpdate = useRef("");
  const callApiChangeImageSuccess = useRef(false);
  const [valueSearch, setValueSearch] = useState("");
  const clearSetSearch = useRef(0);
  const [openModal, setOpenModal] = React.useState(false);
  const selectedPhim = useRef(null);
  const isMobile = useMediaQuery("(max-width:768px)");
  useEffect(() => {
    if (
      !movieList2 ||
      successUpdateMovie ||
      successUpdateNoneImageMovie ||
      successDeleteMovie ||
      errorDeleteMovie ||
      successAddUploadMovie
    ) {
      dispatch(getMovieListManagement());
    }
  }, [
    successUpdateMovie,
    successUpdateNoneImageMovie,
    successDeleteMovie,
    errorDeleteMovie,
    successAddUploadMovie,
  ]); // khi v???a th??m phim m???i xong m?? x??a li??n backend s??? b??o l???i x??a kh??ng ???????c nh??ng th???c ch???t ???? x??a th??nh c??ng > errorDeleteMovie nh??ng v???n ti???n h??nh l??m m???i l???i danh s??ch

  useEffect(() => {
    return () => {
      dispatch(resetMoviesManagement());
    };
  }, []);
  useEffect(() => {
    if (movieList2) {
      let newMovieListDisplay = movieList2.map((movie) => ({
        ...movie,
        hanhDong: "",
        id: movie.maPhim,
      }));
      setMovieListDisplay(newMovieListDisplay);
    }
  }, [movieList2]);

  useEffect(() => {
    // delete movie xong th?? th??ng b??o
    if (errorDeleteMovie === "X??a th??nh c??ng nh??ng backend return error") {
      successDeleteMovie = "X??a th??nh c??ng !";
    }
    if (successDeleteMovie) {
      enqueueSnackbar(successDeleteMovie, { variant: "success" });
      return;
    }
    if (errorDeleteMovie) {
      enqueueSnackbar(errorDeleteMovie, { variant: "error" });
    }
  }, [errorDeleteMovie, successDeleteMovie]);

  useEffect(() => {
    if (successUpdateMovie || successUpdateNoneImageMovie) {
      callApiChangeImageSuccess.current = true;
      enqueueSnackbar(
        `Update th??nh c??ng phim: ${successUpdateMovie.tenPhim ?? ""}${
          successUpdateNoneImageMovie.tenPhim ?? ""
        }`,
        { variant: "success" }
      );
    }
    if (errorUpdateMovie || errorUpdateNoneImageMovie) {
      callApiChangeImageSuccess.current = false;
      enqueueSnackbar(
        `${errorUpdateMovie ?? ""}${errorUpdateNoneImageMovie ?? ""}`,
        { variant: "error" }
      );
    }
  }, [
    successUpdateMovie,
    errorUpdateMovie,
    successUpdateNoneImageMovie,
    errorUpdateNoneImageMovie,
  ]);

  useEffect(() => {
    if (successAddUploadMovie) {
      enqueueSnackbar(
        `Th??m th??nh c??ng phim: ${successAddUploadMovie.tenPhim}`,
        { variant: "success" }
      );
    }
    if (errorAddUploadMovie) {
      enqueueSnackbar(errorAddUploadMovie, { variant: "error" });
    }
  }, [successAddUploadMovie, errorAddUploadMovie]);

  // x??a m???t phim
  const handleDeleteOne = (maPhim) => {
    if (!loadingDeleteMovie) {
      // n???u click x??a li??n t???c m???t user
      dispatch(deleteMovie(maPhim));
    }
  };
  const handleEdit = (phimItem) => {
    selectedPhim.current = phimItem;
    setOpenModal(true);
  };

  const onUpdate = (movieObj, hinhAnh, fakeImage) => {
    if (loadingUpdateMovie || loadingUpdateNoneImageMovie) {
      return undefined;
    }
    setOpenModal(false);
    newImageUpdate.current = fakeImage;
    if (typeof hinhAnh === "string") {
      // n???u d??ng updateMovieUpload s??? b??? reset danhGia v??? 10
      const movieUpdate = movieListDisplay.find(
        (movie) => movie.maPhim === fakeImage.maPhim
      ); // l???y ra url g???c, tr??nh g???i base64 t???i backend
      movieObj.hinhAnh = movieUpdate.hinhAnh;
      dispatch(updateMovie(movieObj));
      return undefined;
    }
    dispatch(updateMovieUpload(movieObj));
  };
  const onAddMovie = (movieObj) => {
    if (!loadingAddUploadMovie) {
      dispatch(addMovieUpload(movieObj));
    }
    setOpenModal(false);
  };
  const handleAddMovie = () => {
    const emtySelectedPhim = {
      maPhim: "",
      tenPhim: "",
      biDanh: "",
      trailer: "",
      hinhAnh: "",
      moTa: "",
      maNhom: "",
      ngayKhoiChieu: "",
      danhGia: 10,
    };
    selectedPhim.current = emtySelectedPhim;
    setOpenModal(true);
  };

  const handleInputSearchChange = (props) => {
    clearTimeout(clearSetSearch.current);
    clearSetSearch.current = setTimeout(() => {
      setValueSearch(props);
    }, 500);
  };

  const onFilter = () => {
    // d??ng useCallback, slugify b??? d???u ti???ng vi???t
    let searchMovieListDisplay = movieListDisplay.filter((movie) => {
      const matchTenPhim =
        slugify(movie.tenPhim ?? "", modifySlugify)?.indexOf(
          slugify(valueSearch, modifySlugify)
        ) !== -1;
      const matchMoTa =
        slugify(movie.moTa ?? "", modifySlugify)?.indexOf(
          slugify(valueSearch, modifySlugify)
        ) !== -1;
      const matchNgayKhoiChieu =
        slugify(movie.ngayKhoiChieu ?? "", modifySlugify)?.indexOf(
          slugify(valueSearch, modifySlugify)
        ) !== -1;
      return matchTenPhim || matchMoTa || matchNgayKhoiChieu;
    });
    if (newImageUpdate.current && callApiChangeImageSuccess.current) {
      // hi???n th??? h??nh b???ng base64 thay v?? url, l???i react kh??ng hi???n th??? ????ng h??nh m???i c???p nh???t(???? c???p h??nh thanh c??ng nh??ng url backend tr??? v??? gi??? nguy??n ???????ng d???n)
      searchMovieListDisplay = searchMovieListDisplay.map((movie) => {
        if (movie.maPhim === newImageUpdate.current.maPhim) {
          return { ...movie, hinhAnh: newImageUpdate.current.srcImage };
        }
        return movie;
      });
    }
    return searchMovieListDisplay;
  };

  const columns = [
    {
      field: "hanhDong",
      headerName: "H??nh ?????ng",
      width: 130,
      renderCell: (params) => (
        <Action
          onEdit={handleEdit}
          onDeleted={handleDeleteOne}
          phimItem={params.row}
        />
      ),
      headerAlign: "center",
      align: "left",
      headerClassName: "custom-header",
    },
    {
      field: "tenPhim",
      headerName: "T??n phim",
      width: 250,
      headerAlign: "center",
      align: "left",
      headerClassName: "custom-header",
      renderCell: RenderCellExpand,
    },
    {
      field: "trailer",
      headerName: "Trailer",
      width: 130,
      renderCell: (params) => (
        <div style={{ display: "inline-block" }}>
          <ThumbnailYoutube urlYoutube={params.row.trailer} />
        </div>
      ),
      headerAlign: "center",
      align: "center",
      headerClassName: "custom-header",
    },
    {
      field: "hinhAnh",
      headerName: "H??nh ???nh",
      width: 200,
      headerAlign: "center",
      align: "center",
      headerClassName: "custom-header",
      renderCell: (params) => RenderCellExpand(params),
    },
    {
      field: "moTa",
      headerName: "M?? T???",
      width: 200,
      headerAlign: "center",
      align: "left",
      headerClassName: "custom-header",
      renderCell: RenderCellExpand,
    },
    {
      field: "ngayKhoiChieu",
      headerName: "Ng??y kh???i chi???u",
      width: 160,
      type: "date",
      headerAlign: "center",
      align: "center",
      headerClassName: "custom-header",
      valueFormatter: (params) => params.value.slice(0, 10),
    },
    {
      field: "danhGia",
      headerName: "????nh gi??",
      width: 120,
      headerAlign: "center",
      align: "center",
      headerClassName: "custom-header",
    },
    { field: "maPhim", hide: true, width: 130 },
    { field: "maNhom", hide: true, width: 130 },
    { field: "biDanh", hide: true, width: 200, renderCell: RenderCellExpand },
  ];
  const modifySlugify = { lower: true, locale: "vi" };
  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <div className={classes.control}>
        <div className="row">
          <div className={`col-12 col-md-6 ${classes.itemCtro}`}>
            <Button
              variant="contained"
              color="primary"
              className={classes.addMovie}
              onClick={handleAddMovie}
              disabled={loadingAddUploadMovie}
              startIcon={<AddBoxIcon />}
            >
              th??m phim
            </Button>
          </div>
          <div className={`col-12 col-md-6 ${classes.itemCtro}`}>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search???"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                onChange={(evt) => handleInputSearchChange(evt.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <DataGrid
        className={classes.rootDataGrid}
        rows={onFilter()}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[10, 25, 50]}
        // hi???n loading khi
        loading={
          loadingUpdateMovie ||
          loadingDeleteMovie ||
          loadingMovieList2 ||
          loadingUpdateNoneImageMovie
        }
        components={{
          LoadingOverlay: CustomLoadingOverlay,
          Toolbar: GridToolbar,
        }}
        // sort
        sortModel={[{ field: "tenPhim", sort: "asc" }]}
      />
      <Dialog open={openModal}>
        <DialogTitle onClose={() => setOpenModal(false)}>
          {selectedPhim?.current?.tenPhim
            ? `S???a phim: ${selectedPhim?.current?.tenPhim}`
            : "Th??m Phim"}
        </DialogTitle>
        <DialogContent dividers>
          <Form
            selectedPhim={selectedPhim.current}
            onUpdate={onUpdate}
            onAddMovie={onAddMovie}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
