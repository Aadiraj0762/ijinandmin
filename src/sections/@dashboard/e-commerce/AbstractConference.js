import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Divider, Grid, Stack, Typography, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// routes
import FormProvider, { RHFEditor, RHFTextField } from '../../../components/hook-form';
import { useSnackbar } from '../../../components/snackbar';
import { PATH_DASHBOARD } from '../../../routes/paths';

// components
import {
  createAbstract,
  getAbstractById,
  updateAbstract,
} from '../../../controller/abstractconferenceController';

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
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();

  const ConferenceSchema = Yup.object().shape({
    conferenceName: Yup.string().required('Title of conference/symposium is required'),
    title: Yup.string().required('Date of conference/symposium is required').nullable(),
    authors: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required('Author name is required'),
          affiliation: Yup.string().required('Affiliation is required'),
        })
      )
      .min(1, 'At least one author is required'),

    abstract: Yup.string().required('Abstract is required'),
    linkDOI: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      conferenceName: currentConference?.conferenceName || '',
      title: currentConference?.title || '',
      authors: currentConference?.authors || [{ name: '', affiliation: '' }],
      abstract: currentConference?.abstract || '',
      keyword: currentConference?.keyword || '',
      linkDOI: currentConference?.linkDOI || '',
    }),
    [currentConference]
  );

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
          console.log(conference)
          if (conference) {
            reset({
              conferenceName: conference.conferenceName || '',
              title: conference.title || '',
              authors: conference.authors || [{ name: '', affiliation: '' }],
              abstract: conference.abstract || '',
              keyword: conference.keyword || '',
              linkDOI: conference.linkDOI || '',
            });
          } else {
            enqueueSnackbar('Conference not found', { variant: 'error' });
            navigate(PATH_DASHBOARD.conference.list);
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
    if (currentConference) {
      reset(defaultValues);
    }
  }, [currentConference, isEdit, reset, defaultValues]);

  const onSubmit = async (data) => {
   
    try {
      if (isEdit) {
        await updateAbstract(id, data);
      } else {
        await createAbstract(data);
      }
      reset();
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate('/');
    } catch (error) {
      console.error('Submission error:', error);
      enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" alignItems="center">
              <Divider style={{ flexGrow: 1 }} />
              <Typography variant="h4" style={{ margin: '0 16px', whiteSpace: 'nowrap' }}>
                Abstract / Articles Conference-Symposium Submission
              </Typography>
              <Divider style={{ flexGrow: 1 }} />
            </Box>

            <Stack spacing={3} style={{ marginTop: '30px' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="conferenceName" label="Conference-Symposium" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="title" label="Title" />
                </Grid>

                <Grid item xs={12}>
                  {fields.map((item, index) => (
                    <Stack direction="column" spacing={2} style={{ margin: '5px' }} key={item.id}>
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
                          <IconButton color="error" onClick={() => remove(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Stack>
                  ))}
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Typography variant="title" style={{ fontWeight: 'bold', marginTop: '30px' }}>
                    Abstract
                  </Typography>
                  <RHFEditor simple name="description" />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <RHFTextField name="keyword" label="Keywords" />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <RHFTextField name="linkDOI" label="Link/DOI" />
                </Grid>
              </Grid>

              <Grid container spacing={2} justifyContent="flex-end" style={{ marginTop: '30px' }}>
                <Grid item>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={isSubmitting}
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
  );
}
