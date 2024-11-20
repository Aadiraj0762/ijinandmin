import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm } from 'react-hook-form';
// @mui
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
// routes
import FormProvider, { RHFEditor, RHFTextField } from '../../../../components/hook-form';
import { useSnackbar } from '../../../../components/snackbar';
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import {
  createAbstract,
  getAbstractById,
  updateAbstract,
} from '../../../../controller/abstractController';

// ----------------------------------------------------------------------

const COUNTRY_OPTIONS = [
  { label: 'USA', value: 'USA' },
  { label: 'Canada', value: 'Canada' },
  { label: 'India', value: 'India' },
  // Add more countries as needed
];

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  // Add more languages as needed
];

// ----------------------------------------------------------------------

ConferenceForm.propTypes = {
  isEdit: PropTypes.bool,
  currentConference: PropTypes.object,
};

function countryToFlag(isoCode) {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    : isoCode;
}

export default function ConferenceForm({ isEdit, currentConference }) {
  console.log("journel")
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();

  const ConferenceSchema = Yup.object().shape({
    journalName: Yup.string().required('Journal name is required'),
    issn: Yup.string().required('ISSN is required'),
    publisher: Yup.string().required('Publisher is required'),
    title: Yup.string().required('Title is required'),
    affiliation: Yup.string().required('Affiliation is required'),
    authors: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required('Author name is required'),
          affiliation: Yup.string().required('Affiliation is required'),
        })
      )
      .min(1, 'At least one author is required'),
    abstract: Yup.string().required('Abstract is required'),
    keyword: Yup.string().required('Keyword is required'),
    linkDOI: Yup.string(),
    articleType: Yup.string().max(20000, 'Description must not exceed 200 words'),
  });

  const defaultValues = useMemo(
    () => ({
      journalName: currentConference?.journalName || '',
      issn: currentConference?.issn || '',
      publisher: currentConference?.publisher || '',
      title: currentConference?.title || '',
      affiliation: currentConference?.affiliation || '',
      authors: currentConference?.authors || [{ name: '', affiliation: '' }],
      abstract: currentConference?.abstract || '',
      keyword: currentConference?.keyword || '',
      linkDOI: currentConference?.linkDOI || '',
      articleType: currentConference?.articleType || '',
    }),
    [currentConference]
  );

  console.log("defaultValues", defaultValues)

  const methods = useForm({
    resolver: yupResolver(ConferenceSchema),
    defaultValues,
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'authors',
  });

  useEffect(() => {
    const fetchConference = async () => {
      if (isEdit) {
        try {
          const conference = await getAbstractById(id);
          if (conference) {
            // Convert Firestore Timestamp to JavaScript Date
            const formattedDate = conference.date?.toDate ? conference.date.toDate() : '';

            reset({
              journalName: conference.journalName || '', // changed to conference.journalName
              issn: conference.issn || '',
              publisher: conference.publisher || '',
              title: conference.title || '',
              affiliation: conference.affiliation || '',
              //   authorName: conference.authorName || '',
              authors: conference.authors || [{ name: '', affiliation: '' }],

              abstract: conference.abstract || '',
              linkDOI: conference.linkDOI || '',
              articleType: conference.articleType || '',
            });
          } else {
            enqueueSnackbar('Conference not found', { variant: 'error' });
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching conference:', error);
          enqueueSnackbar('An error occurred while fetching conference details', {
            variant: 'error',
          });
        }
      }
    };

    fetchConference();
  }, [isEdit, id, reset, navigate, enqueueSnackbar]);

  useEffect(() => {
    reset(defaultValues);
  }, [isEdit, currentConference, reset, defaultValues]);

  const onSubmit = async (data) => {
    console.log("Data", data);
    try {
      if (isEdit) {
        await updateAbstract(id, data); // Update function with authors array
      } else {
        await createAbstract(data); // Create function with authors array
      }
      reset();
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_DASHBOARD.conference.list);
    } catch (error) {
      console.error('Submission error:', error);
      enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
    }
  };


  const handleTemp = () => {
    console.log("Submitting", methods)
  }

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Divider style={{ flexGrow: 1 }} />
                <Typography
                  variant="h4"
                  style={{ margin: '0 16px', whiteSpace: 'nowrap' }}
                >
                  Abstract / Articles Journal Submission
                </Typography>
                <Divider style={{ flexGrow: 1 }} />
              </Box>

              <Stack spacing={3} style={{ marginTop: '30px' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="journalName" label="Journal Name" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="issn" label="ISSN" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="publisher" label="Publisher" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="title" label="Title" />
                  </Grid>

                  <Grid item xs={12}>
                    {fields.map((item, index) => (
                      <Stack direction="column" spacing={2} key={item.id}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={5}>
                            <RHFTextField
                              name={`authors[${index}].name`}
                              label={`Author ${index + 1}`}
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <RHFTextField
                              name={`authors[${index}].affiliation`}
                              label="Affiliation"
                            />
                          </Grid>
                          <Grid item xs={2} display="flex" justifyContent="flex-end">
                            <IconButton
                              color="primary"
                              onClick={() => append({ name: '', affiliation: '' })}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => index !== 0 && remove(index)}
                              disabled={index === 0}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Stack>
                    ))}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 'bold', marginTop: '30px' }}
                    >
                      Abstract
                    </Typography>
                    <RHFEditor simple name="description" />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <RHFTextField name="keyword" label="Keywords" />
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <RHFTextField name="Year" label="Year of Publishing" />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <RHFTextField name="Volume/Issue" label="Volume/Issue" />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <RHFTextField name="PageNumber" label="Page Number" />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="linkDOI" label="Link/DOI" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="articleType" label="Article Type" />
                  </Grid>
                </Grid>

                <Grid
                  container
                  spacing={2}
                  justifyContent="flex-end"
                  style={{ marginTop: '30px' }}
                >
                  <Grid item>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      size="large"
                      loading={isSubmitting}
                      onClick={handleTemp}
                    >
                      {!isEdit ? 'Submit' : 'Save Changes'}
                    </LoadingButton>
                  </Grid>
                  <Grid item>
                    <LoadingButton
                      type="button"
                      variant="outlined"
                      size="large"
                      onClick={() => reset()}
                    >
                      Reset
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>

      <br />

    </>
  );
}
