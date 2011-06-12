<?php
	require_once('inc.global.php');

  $sim = trim($_GET['term']);
  if (strlen($sim) > 2) {
    $vocs = Array();
    foreach (Vocabulary::getSimilarVocabularies($sim) as $voc)
      $vocs[] = $voc->getData();
    echo json_encode($vocs);
  }

?>
