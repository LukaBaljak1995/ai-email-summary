"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { useSummaries } from "../hooks/useSummaries";
import { formatDisplayDate, formatExpiryDate } from "../lib/format";

export default function Page() {
  const {
    error,
    isMockData,
    loading,
    markRead,
    selected,
    selectedDate,
    setSelectedDate,
    summaries
  } = useSummaries();

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight={800}>
                  Gmail Deal Digest
                </Typography>
                <Typography color="text.secondary">
                  Daily action items from unread Promotions and Social emails.
                </Typography>
              </Box>

              {isMockData && (
                <Alert severity="info">
                  Localhost detected. The app is using mocked summary data.
                </Alert>
              )}

              {error && <Alert severity="error">{error}</Alert>}

              <FormControl fullWidth>
                <InputLabel>Choose day</InputLabel>
                <Select
                  label="Choose day"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                >
                  {summaries.map(summary => (
                    <MenuItem key={summary.date} value={summary.date}>
                      {formatDisplayDate(summary.date)}{" "}
                      {summary.status === "unread" ? "• unread" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {loading && <Alert severity="info">Loading summaries...</Alert>}

              {!loading && !selected && !error && (
                <Alert severity="info">No summaries yet.</Alert>
              )}

              {selected && (
                <>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <Chip
                      label={`Status: ${selected.status}`}
                      color={selected.status === "unread" ? "warning" : "success"}
                    />
                    <Chip label={`Date: ${formatDisplayDate(selected.date)}`} />
                    <Chip label={`Processed: ${selected.processedEmailCount}`} />
                    <Chip label={`Items: ${selected.items?.length || 0}`} />
                  </Stack>

                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
                      Full summary
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        mt: 0,
                        p: 2,
                        bgcolor: "#111",
                        color: "white",
                        borderRadius: 2,
                        whiteSpace: "pre-wrap",
                        overflowX: "auto"
                      }}
                    >
                      {selected.fullSummary}
                    </Box>
                  </Box>

                  <Typography variant="h5" fontWeight={700}>
                    Action items
                  </Typography>

                  {selected.items?.length === 0 && (
                    <Alert severity="success">No worthwhile items.</Alert>
                  )}

                  <Stack spacing={2}>
                    {selected.items?.map(item => (
                      <Card key={item.emailId} variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Stack spacing={1.5}>
                            <Typography variant="h6" fontWeight={700}>
                              {item.subject}
                            </Typography>

                            <Typography>{item.reason}</Typography>

                            <Stack direction="row" gap={1} flexWrap="wrap">
                              <Chip label={item.category} />
                              <Chip
                                label={item.recommendation}
                                color={
                                  item.recommendation === "high"
                                    ? "error"
                                    : item.recommendation === "medium"
                                      ? "warning"
                                      : "default"
                                }
                              />
                              {item.deal && <Chip label={item.deal} color="primary" />}
                              {item.expiresAt && (
                                <Chip label={`Expires ${formatExpiryDate(item.expiresAt)}`} />
                              )}
                            </Stack>

                            <Typography variant="caption" color="text.secondary">
                              {item.sender}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>

                  {selected.status !== "read" && (
                    <Button variant="contained" size="large" onClick={markRead}>
                      Mark summary as read
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
