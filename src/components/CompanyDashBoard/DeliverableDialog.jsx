"use client";

import { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import PropTypes from "prop-types";

export default function TimelineActionDialog({ timeline, onUpdate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timelineSummary, setTimelineSummary] = useState(
    timeline?.timelineSummary || ""
  );
  const [savingSummary, setSavingSummary] = useState(false);

  const handleUploadClick = () => {
    setTimelineSummary(timeline?.timelineSummary || "");
    setDialogOpen(true);
  };

  const saveTimelineSummary = async () => {
    if (!timeline) return;

    setSavingSummary(true);
    try {
      await updateDoc(doc(db, "timelines", timeline.id), {
        timelineSummary: timelineSummary,
        updatedAt: new Date(),
      });

      onUpdate(timeline.id, timelineSummary);
      setDialogOpen(false);
      alert("Timeline summary saved successfully!");
    } catch (error) {
      console.error("Error saving timeline summary:", error);
      alert("Failed to save timeline summary");
    } finally {
      setSavingSummary(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={timeline?.status !== "completed"}
        onClick={handleUploadClick}
        className="p-2 bg-transparent"
      >
        <Upload className="h-4 w-4" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Timeline Summary</DialogTitle>
            <DialogDescription>
              Add a summary or link for the completed timeline item "
              {timeline?.title}". This is optional and can be left empty.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter timeline summary, deliverable link, or any notes about the completed timeline item..."
              value={timelineSummary}
              onChange={(e) => setTimelineSummary(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={savingSummary}
            >
              Cancel
            </Button>
            <Button
              onClick={saveTimelineSummary}
              disabled={savingSummary}
              className="bg-[#00B2E2] hover:bg-[#0099CC]"
            >
              {savingSummary ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

TimelineActionDialog.propTypes = {
  timeline: PropTypes.any,
  onUpdate: PropTypes.func.isRequired,
};
